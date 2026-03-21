# C6L / Planetair Gestion 4.0 — Contexte technique

## Architecture globale

Le projet repose sur la distribution **API Platform** avec une architecture en 5 services Docker :

```
┌──────────────────────────────────────────────────────────────┐
│  PWA (Next.js 14)  ←→  PHP (Symfony 7 / FrankenPHP / Caddy) │
│         ↕                        ↕                           │
│    Keycloak (OIDC)         PostgreSQL 16                     │
│    Keycloak-DB (PG)                                          │
└──────────────────────────────────────────────────────────────┘
```

| Composant | Stack |
|-----------|-------|
| **Backend** | Symfony 7.1, PHP 8.3, API Platform 4.0, Doctrine ORM |
| **Frontend** | Next.js 14, React 18, TypeScript, React-Admin |
| **Auth** | Keycloak (OIDC/JWT), NextAuth v5 |
| **BDD** | PostgreSQL 16.4 |
| **Reverse Proxy** | Caddy (FrankenPHP) — pas de nginx applicatif |
| **Temps réel** | Mercure |
| **Déploiement** | Docker Compose / Kubernetes (Helm) / GKE |
| **CI/CD** | GitHub Actions, Playwright (E2E), k6 (charge) |

### Proxy externe (production)

Nginx 1.18 (Ubuntu) en reverse proxy devant Docker. Config :
- `large_client_header_buffers 4 32k;` (tokens Keycloak volumineux)
- SSL Let's Encrypt via Certbot
- Proxy vers `127.0.0.1:8081` (Caddy dans le container PHP)

---

## Backend — 28 entités métier

Le domaine couvre la gestion complète d'une base ULM.

### Coeur métier

| Entité | Rôle | Tenant |
|--------|------|--------|
| **Client** | Multi-tenant : logo, couleurs, modules activés, GPS | — |
| **User** | Utilisateurs liés à Keycloak (UUID, rôles OIDC) | ManyToMany Client |
| **ProfilPilote** | Profil pilote, heures de vol, disponibilité | Global |
| **Aeronef** | Immatriculation, horamètre, seuil alerte, balise | ✅ TenantAware |
| **Prestation** | Session de vol (durée, horamètre départ/fin, CA) | ✅ TenantAware |
| **Vol** | Détail vol (quantité, durée, prix, coût) | ✅ TenantAware |
| **Landing** | Atterrissages (code OACI, touchés, complets) | ✅ TenantAware |
| **CarnetVol** | Carnet de vol pilote (date, durée, lieux) | Global |

### Réservations & Commerce

| Entité | Rôle | Tenant |
|--------|------|--------|
| **Reservation** | Réservation client (statut, paiement, code) | ✅ TenantAware |
| **Circuit** | Type de vol (nom, prix, durée, avec options) | ✅ TenantAware |
| **Option / Combinaison** | Options tarifaires | ✅ TenantAware |
| **Cadeau** | Bons cadeaux (code, validité, intégration Wix) | ✅ TenantAware |
| **Contact / Origine** | Sources et contacts | ✅ TenantAware |
| **Passager** | Inscription RGPD passagers | ✅ TenantAware |

### Finances & Maintenance

| Entité | Rôle | Tenant |
|--------|------|--------|
| **Payment / PaymentDetail** | Paiements multi-modes | ✅ TenantAware |
| **Expense** | Dépenses (liées ou non à la maintenance) | ✅ TenantAware |
| **Entretien** | Maintenance aéronef (horamètre, intervenants) | ✅ TenantAware |
| **Qualification** | Qualifications pilote (validité, alertes) | Global |
| **CertificatMedical** | Certificats médicaux (type, validité) | Global |
| **Disponibilite** | Créneaux de disponibilité pilote | Global |

### Support

| Entité | Rôle | Tenant |
|--------|------|--------|
| **Airport** | Aérodromes (code, météo, caméras) | ✅ TenantAware |
| **Camera** | Caméras terrain | ✅ TenantAware |
| **Rappel** | Rappels/alertes planifiées | ✅ TenantAware |
| **MediaObject** | Fichiers uploadés (photos, documents) | ✅ TenantAware |
| **Nature** | Types de vol (code, label) | Global (référentiel partagé) |

---

## Multi-tenant — Architecture implémentée

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                  MULTI-TENANT OPÉRATIONNEL                  │
│                                                             │
│  20/28 entités liées à Client (TenantAwareInterface)        │
│  User ←→ Client : ManyToMany (1 user, N clubs)             │
│  Résolution tenant : header HTTP X-Client-Id                │
│  Filtre Doctrine global : ClientTenantFilter                │
│  Auto-assign : TenantAssignSubscriber (POST)                │
│  Sécurité : ClientTenantVoter                               │
│  Frontend : ClientSelector dans l'AppBar                    │
│                                                             │
│  Entités globales (partagées entre clubs) :                  │
│  ProfilPilote, CarnetVol, Qualification, CertificatMedical  │
│  Disponibilite, Nature, PilotQualification                  │
└─────────────────────────────────────────────────────────────┘
```

### Mécanisme de résolution du tenant

```
Frontend (sessionStorage)
    ↓ X-Client-Id: {id}
Caddy (reverse proxy)
    ↓
TenantFilterListener (KernelEvents::REQUEST, priority 10)
    ↓ active le filtre Doctrine si X-Client-Id valide
ClientTenantFilter (SQL : WHERE client_id = :id)
    ↓ appliqué à toute requête SELECT sur les TenantAware
Résultat : seules les données du tenant courant remontent
```

### Composants backend

| Composant | Fichier | Rôle |
|-----------|---------|------|
| **TenantAwareInterface** | `Entity/TenantAwareInterface.php` | Contrat : `getClient()` / `setClient()` |
| **TenantAwareTrait** | `Entity/TenantAwareTrait.php` | ManyToOne Client (nullable), getter/setter |
| **ClientTenantFilter** | `Doctrine/Orm/Filter/ClientTenantFilter.php` | Filtre SQL automatique `WHERE client_id = :id` |
| **TenantFilterListener** | `EventListener/TenantFilterListener.php` | Active le filtre Doctrine depuis le header `X-Client-Id` |
| **TenantAssignSubscriber** | `EventSubscriber/TenantAssignSubscriber.php` | Assigne `client_id` automatiquement sur POST |
| **ClientTenantVoter** | `Security/Voter/ClientTenantVoter.php` | Vérifie que l'user a accès au tenant (attribute `TENANT_ACCESS`) |
| **ClientGetter** | `Service/ClientGetter.php` | Résout le client courant (header → fallback premier client) |

### Relation User ↔ Client

- `User.clients` : ManyToMany (table pivot `user_client`)
- `Client.users` : ManyToMany (inversedBy)
- Un utilisateur peut être rattaché à plusieurs clubs
- `User::hasClient(Client)` vérifie l'appartenance
- Le super-admin (`ROLE_SUPER_ADMIN`) bypass la vérification

### Configuration Doctrine

```yaml
# doctrine.yaml
filters:
    client_tenant:
        class: App\Doctrine\Orm\Filter\ClientTenantFilter
        enabled: false  # activé dynamiquement par TenantFilterListener
```

---

## Stockage des images — Par client

### Structure de fichiers

```
public/images/                        ← images par défaut (fallback)
├── logo.png
├── FlightIcon.png                    ← icône carte par défaut
├── Plane.png                         ← fond PDF par défaut
├── Thanks.png                        ← image remerciement par défaut
├── favicon.ico
└── apple-touch-icon.png

public/images/client/
├── {clientId}/                       ← dossier créé au premier upload
│   ├── logo.png
│   ├── FlightIcon.png
│   ├── Plane.png
│   ├── Thanks.png
│   └── favicon.ico
```

### Chaîne de fallback

```
client.logo (en base)  →  /images/client/{id}/logo.png
       null ?          →  /images/logo.png (défaut du site)
```

### Composants

| Composant | Rôle |
|-----------|------|
| **FileUploader** | `upload(file, type, opacity, clientId)` — crée le dossier `client/{id}/` |
| **UploadClientAssetController** | `POST /admin/upload/client-asset` — accepte `clientId` (body ou header) |
| **ClientInputDataTransformer** | Persist le client d'abord (pour obtenir l'ID), puis upload les images |

### Configuration des chemins (services.yaml)

```yaml
image.client_dir: '/srv/api/public/images/client'   # → /images/client/{id}/
image.shared_dir: '/srv/api/public/images'           # → images par défaut
image.public_dir: '/srv/api/public'                  # racine publique
```

---

## Backend — Logique métier clé

### Contrôleurs spécialisés

- **ExportController** — Exports CSV/PDF (17 entités exportables)
- **ShopController** — Webhook Wix (achat bons cadeaux, vérification HMAC)
- **CadeauController** — Téléchargement PDF bons cadeaux
- **MicrotrakProxyController** — Proxy GPS tracking en vol
- **CreateClientController** — Création client avec upload multipart
- **UploadClientAssetController** — Upload images client avec isolation par ID

### Event Subscribers (logique auto)

- **PrestationCreateSubscriber** — Mise à jour horamètre, calcul coûts, alertes maintenance, création carnet de vol
- **PaymentSubscriber** — Marquage automatique des réservations payées
- **CarnetVolEditSubscriber** — Ajout heures de vol au profil pilote
- **EntitiesMetaSubscriber** — Timestamps créé/modifié sur les entités
- **TenantAssignSubscriber** — Auto-assign `client_id` sur les nouvelles entités tenant-aware

### Sécurité

- Authentification **OIDC** via Keycloak (Bearer token)
- Hiérarchie de rôles : `OIDC_USER → ROLE_USER`, `OIDC_ADMIN → ROLE_ADMIN`
- **ClientTenantVoter** : vérifie `User.hasClient(entity.getClient())`
- **ROLE_SUPER_ADMIN** : accès à tous les tenants
- Endpoint Wix sans auth (vérifié par HMAC)

---

## Frontend — PWA React-Admin

### Pages publiques

| Route | Fonction |
|-------|----------|
| `/` | Formulaire inscription passager (RGPD) |
| `/thanks` | Page de remerciement |
| `/admin` | Interface d'administration complète |
| `/auth/signin` | Redirection automatique vers Keycloak (plus de page MissingCSRF) |

### Flux d'authentification

```
/admin → AdminWithOIDC vérifie la session
    ↓ pas de session ?
signIn("keycloak") → Keycloak login
    ↓ callback
/api/auth/callback/keycloak → NextAuth crée la session
    ↓
/admin avec session active
```

- **NextAuth v5** avec Keycloak provider (PKCE, `token_endpoint_auth_method: "none"`)
- Refresh token automatique
- Secret via `process.env.AUTH_SECRET`
- Page `/auth/signin` : custom page qui appelle `signIn("keycloak")` automatiquement

### Interface Admin (React-Admin)

**35+ modules CRUD** couvrant toutes les entités, avec :

- Listes, création, édition, détail pour chaque ressource
- **Dashboard** avec :
  - Météo METAR/TAF temps réel
  - Carte Leaflet (aérodromes, GPS tracking via Microtrak)
  - Graphiques ApexCharts
  - Caméras terrain
  - Calendrier de réservations
- **ClientSelector** dans l'AppBar (switch de tenant sans rechargement page)
- Internationalisation FR/EN

### Gestion multi-tenant frontend

| Composant | Rôle |
|-----------|------|
| **ClientProvider** | React Context : charge tous les clients, gère le switch |
| **ClientSelector** | Select MUI dans l'AppBar (visible si >1 client) |
| **getClientHeaders()** | Lit `sessionStorage['client']` → header `X-Client-Id` |
| **Admin.tsx** | Injecte `X-Client-Id` dans `fetchHydra` et `apiDocumentationParser` |
| **dataAccess.ts** | Injecte `X-Client-Id` dans toutes les requêtes `fetchApi` |
| **uploadImages()** | Envoie `clientId` dans le FormData pour les uploads d'images |
| **api.ts** | `API_DOMAIN` dynamique : `window.origin` (client) / `NEXT_PUBLIC_ENTRYPOINT` (SSR) — plus d'URL hardcodée |
| **FormLayout.tsx** | Liens `/admin` et `/oidc/` en URLs relatives (plus de domaine hardcodé) |

Le switch de tenant utilise `useRefresh()` de React Admin (pas de rechargement page).

### Stack UI

- **Tailwind CSS** + **Material UI** + **NextUI**
- Polices Poppins / Satoshi / Inter
- Animations Framer Motion

---

## Infrastructure & DevOps

### Docker Compose (5 services)

| Service | Image | Rôle |
|---------|-------|------|
| **php** | FrankenPHP + Caddy | API Symfony + reverse proxy interne |
| **pwa** | Node 21 Alpine | Next.js (prod: `next build` + `node server.js`) |
| **database** | PostgreSQL 16.4 | BDD applicative |
| **keycloak** | Keycloak | Authentification OIDC |
| **keycloak-database** | PostgreSQL 16.4 | BDD Keycloak |

### Volumes Docker

- `caddy_data` / `caddy_config` — certificats TLS Caddy
- `db_data` — données PostgreSQL
- `keycloak_db_data` — données Keycloak
- `./api/public/images` → `/srv/api/public/images` — images client persistantes
- `./api/public/media` → `/srv/api/public/media` — médias uploadés

### Caddy (Caddyfile)

Routage intelligent entre PHP API et Next.js PWA :
- `/oidc/*` → Keycloak
- `@pwa` (HTML, `_next/*`, `api/auth/*`, etc.) → PWA (port 3000)
- `/images/*` → file_server depuis `/srv/api/public` (images persistantes)
- `/media/*` → file_server depuis `/app/public`
- Tout le reste → `php_server` (API Symfony)

### Kubernetes (Helm)

- Chart `api-platform` avec PostgreSQL, Keycloak, External-DNS (Cloudflare)
- Ingress nginx + cert-manager (TLS)
- HPA : 1 à 100 réplicas (CPU 50%)
- Déploiement sur **GKE** (Google Kubernetes Engine)

### CI/CD GitHub Actions

| Pipeline | Fonction |
|----------|----------|
| **CI** | Build → Tests unitaires (PHPUnit) → Lint (PHP-CS-Fixer, ESLint, Hadolint) → E2E (Playwright) |
| **CD** | Build → Push GAR → Helm deploy → k6 load test |
| **Security** | Scan Trivy hebdomadaire |
| **Cleanup** | Suppression namespace PR à la fermeture |

### Serveur de production

- **VPS** : 4 Go RAM, Ubuntu, IP `104.248.131.111`
- **Swap** : 2 Go (`/swapfile`) — garde de sécurité mémoire
- **Nginx externe** : reverse proxy HTTPS → Docker (port 8081)
- **SSL** : Let's Encrypt (Certbot)
- **Domaine** : `c6l.creazot.com`

---

### Déploiement production

Le déploiement PWA utilise le profil production (pages pré-compilées, `node server.js`) :

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d --build pwa
```

Performances mesurées en production :

| Route | Temps de réponse |
|-------|-----------------|
| `/` | ~350ms |
| `/admin` | ~130ms |
| `/auth/signin` | ~110ms |

---

## Points forts

1. **Multi-tenant opérationnel** — 20 entités isolées par client, filtre Doctrine global, sélecteur frontend
2. **Architecture mature** — Stack API Platform complète, bien structurée
3. **Personnalisation client** — Entité Client riche (40+ champs, modules activables)
4. **Images par client** — Stockage isolé `images/client/{id}/` avec fallback vers les defaults
5. **Production optimisée** — PWA buildée en mode production (`next build` + `node server.js`), démarrage en 83ms, pages pré-compilées
6. **Sécurité auth** — Secret NextAuth via variable d'environnement `AUTH_SECRET`, `getSession()` correctement awaité
7. **Zéro URL hardcodée** — `API_DOMAIN` résolu dynamiquement (`window.origin` / `NEXT_PUBLIC_ENTRYPOINT`), liens internes en relatif dans `FormLayout.tsx`
8. **Temps réel** — Mercure pour les mises à jour live
9. **Exports complets** — CSV/PDF pour 17 entités
10. **Intégrations** — Wix (bons cadeaux), Microtrak (GPS), METAR (météo)
11. **CI/CD robuste** — Tests automatisés, déploiement K8s

## Points d'attention

### ~~🔴 Critiques — CORRIGÉS~~

1. ~~**Mode dev en production**~~ → **Corrigé** : le container PWA tourne désormais en mode production (`next build` + `node server.js` via `compose.prod.yaml` target `prod`). Démarrage en 83ms au lieu de 2-3s, pages servies en ~130ms au lieu de 40-60s.

2. ~~**Secret NextAuth hardcodé**~~ → **Corrigé** : `auth.tsx` utilise `secret: process.env.AUTH_SECRET` au lieu du secret en dur. La variable est injectée via `compose.prod.yaml` et le `.env` du serveur.

3. ~~**`getSession()` non awaité**~~ → **Corrigé** : `authProvider.tsx` utilise `await getSession()` dans `logout`, `checkError`, `checkAuth` et `getIdentity`. Import inutilisé `jwtDecode` supprimé.

4. ~~**URL API hardcodée**~~ → **Corrigé** : `api.ts` utilisait `API_DOMAIN = "https://admin.planetair974.re"` en dur. Désormais résolu dynamiquement via `window.origin` côté client et `process.env.NEXT_PUBLIC_ENTRYPOINT` côté serveur. Les liens dans `FormLayout.tsx` (`/admin`, `/oidc/`) sont passés en URLs relatives.

### ~~🟡 Importants — CORRIGÉS~~

5. ~~**Airport/Camera non filtrés par tenant**~~ → **Corrigé** : `Airport` et `Camera` implémentent désormais `TenantAwareInterface`. La relation `ManyToOne(inversedBy)` existante est conservée (pas de `TenantAwareTrait` pour ne pas perdre le `inversedBy` vers `Client::$airports` / `Client::$cameras`). Le filtre Doctrine, le `TenantAssignSubscriber` et le `ClientTenantVoter` s'appliquent maintenant à ces entités. Compteur tenant : 20/28.

6. **Favicon : conservé en mode SaaS** — Le favicon reste celui du site par défaut. Le champ `favicon` de l'entité Client est stocké et uploadable via l'admin mais n'est pas injecté dynamiquement dans le `<head>`. Choix volontaire : un seul favicon pour le SaaS.

7. ~~**thanksImage non utilisée sur la page de remerciement**~~ → **Corrigé** : la page `/thanks` (`pwa/app/thanks/page.tsx`) affiche désormais `client.thanksImage` via un `<img>` conditionnel avant le `thanksMessage`. Import inutilisé `Image` de Next.js supprimé.

### 🟢 Mineurs (dette technique)

8. **Pas de vrai PWA** — Pas de `manifest.json` ni de service worker dans le code. Le titre "PWA" du dossier est hérité d'API Platform mais les fonctionnalités PWA (installation, offline, push notifications) ne sont pas implémentées.

9. **Double config Tailwind** — Deux fichiers coexistent : `tailwind.config.js` et `tailwind.config.ts`. Un seul devrait être conservé.

10. **Dépendances dupliquées** — `react-query` (ancienne version) et `@tanstack/react-query` (nouvelle version) sont toutes les deux installées. Seule `@tanstack/react-query` devrait être conservée.

11. **Deux libs de formulaires** — `formik` et `react-hook-form` coexistent dans les dépendances. Les formulaires devraient être unifiés sur une seule lib.

12. **`ClientProvider.fetchClients()` sans auth** — L'appel `fetch("/clients?pagination=false")` dans le `ClientProvider` ne passe pas de header `Authorization`. Il fonctionne car le cookie de session NextAuth est envoyé automatiquement, mais l'appel pourrait échouer si les cookies sont expirés ou bloqués.

13. ~~**`pdfBackground` non utilisé dans la génération PDF**~~ → **Corrigé** : `PdfGenerator::generate()` résout le client depuis l'entité Cadeau (`$data->getClient()`) avec fallback sur `ClientGetter` (header HTTP). `getEncodedImage()` utilise `client->getPdfBackground()` pour charger l'image du client, avec fallback sur `Plane.png` partagé. Fonctionne en contexte HTTP et non-HTTP (CLI, workers).
