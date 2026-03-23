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

## Backend — 32 entités métier

Le domaine couvre la gestion complète d'une base ULM + un moteur de tarification SaaS.

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

### Tarification SaaS

| Entité | Rôle | Tenant |
|--------|------|--------|
| **PricingCategory** | Grille tarifaire (ex: "Public", "FFPLUM", "Offre Été") | Global |
| **PricingTier** | Palier par nb d'aéronefs (min/max → prix unitaire) | Global (ManyToOne PricingCategory) |
| **ModulePack** | Pack de fonctionnalités (JSON des flags has*) | Global |
| **ModulePackPrice** | Prix d'un pack dans une grille (unique pack×catégorie) | Global (ManyToOne ModulePack + PricingCategory) |

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

## Moteur de tarification SaaS — Implémenté

### Modèle économique

```
Facture mensuelle = (Nb aéronefs × tarif unitaire du palier)
                  + (somme des packs de modules activés)
                  - remise maintenance (% par aéronef isAvailable=false)
```

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  PricingCategory (grille)  ←──  PricingTier (paliers)        │
│       ↑                    ←──  ModulePackPrice (prix/grille)│
│       │                              ↑                       │
│  Client.pricingCategory              │                       │
│  Client.modulePacks ──────→ ModulePack (packs de modules)    │
│  Client.subscriptionStatus (trial/active/suspended/cancelled)│
│  Client.trialEndsAt                                          │
│  Client.maxAeronefs (quota)                                  │
│  Client.monthlyBasePrice (cache)                             │
│  Client.odooCustomerId (Phase 3)                             │
└──────────────────────────────────────────────────────────────┘
```

### Champs ajoutés à Client

| Champ | Type | Rôle |
|-------|------|------|
| `pricingCategory` | ManyToOne → PricingCategory | Grille tarifaire du client |
| `modulePacks` | ManyToMany → ModulePack (table `client_module_pack`) | Packs activés |
| `subscriptionStatus` | string(20), default `trial` | Statut abonnement |
| `trialEndsAt` | DateTimeImmutable (nullable) | Fin de période d'essai |
| `maxAeronefs` | int (nullable) | Quota (null = illimité) |
| `monthlyBasePrice` | float (nullable, read-only) | Prix/aéronef calculé |
| `odooCustomerId` | string(50) (nullable) | ID Odoo (Phase 3) |
| `odooSubscriptionId` | string(50) (nullable) | ID abonnement Odoo (Phase 3) |

### Composants backend

| Composant | Fichier | Rôle |
|-----------|---------|------|
| **AeronefQuotaSubscriber** | `EventSubscriber/AeronefQuotaSubscriber.php` | Bloque POST /aeronefs si quota atteint (403) |
| **PricingCalculatorService** | `Service/PricingCalculatorService.php` | Calcul palier + remise maintenance + total mensuel |
| **ModulePackSyncSubscriber** | `EventSubscriber/ModulePackSyncSubscriber.php` | Synchro packs → flags has* sur Client (PUT) |
| **TrialExpirationCommand** | `Command/TrialExpirationCommand.php` | `app:trial:expire` — cron suspension auto trial expiré |
| **SubscriptionGuardListener** | `EventListener/SubscriptionGuardListener.php` | Bloque API si abonnement suspendu (bypass super-admin) |

### Flux de calcul

```
POST /aeronefs
  → AeronefQuotaSubscriber (PRE_WRITE)
  → Vérifie count < maxAeronefs
  → Si OK → PricingCalculatorService.recalculateForClient()
    → findApplicableTier(category, count)
    → calcul aeronefs: active × price + maintenance × price × (1 - discount%)
    → calcul packs: Σ modulePackPrices pour la category du client
    → met à jour client.monthlyBasePrice
```

### Panel Admin (super_admin)

| Page | Route | Fonction |
|------|-------|----------|
| Grilles tarifaires | `/pricing-categories` | CRUD + tableau enrichi des paliers inline (grille courante surlignée en bleu, autres grilles en comparaison atténuée, ligne maintenance, boutons édition inline) |
| Paliers | `/pricing-tiers` | Matrice pleine page : colonnes = grilles tarifaires (avec chips remise), lignes = paliers (min/max aéronefs), prix en gros caractères, ligne maintenance jaune, simulation bleue (4 aéronefs dont 1 en maintenance), légende, boutons édition inline |
| Packs de modules | `/module-packs` | CRUD + sélecteur des 14 flags has* + tableau tarification inline (paliers aéronefs + prix du pack par grille) |
| Prix des packs | `/module-pack-prices` | Dashboard matrice complète : section paliers aéronefs par grille + section packs de modules avec prix par grille, chips "Inclus", boutons édition inline |
| Abonnements | `/subscriptions` | Dashboard KPIs + tableau clients |
| Onglet Client | dans ClientsEdit | Grille, packs, statut, quota, trial |

### Composants frontend tarification (React-Admin / Material-UI)

| Composant | Fichier | Pattern |
|-----------|---------|---------|
| **PricingTiersList** | `pricingTier/PricingTiersList.tsx` | Matrice pleine page : fetch `pricing-categories` + `pricing-tiers` via `useDataProvider`, rendu `Table` MUI avec en-têtes dynamiques par grille, prix en `Typography h5`, ligne maintenance jaune, ligne simulation bleue (4 aéronefs dont 1 maintenance avec calcul automatique), légende, `IconButton` édition inline |
| **PricingCategoriesEdit** | `pricingCategory/PricingCategoriesEdit.tsx` | Formulaire CRUD + composant `PricingTiersTable` inline : grille courante surlignée (colonne bleue `#e3f2fd`), autres grilles atténuées (`opacity: 0.55`) pour comparaison, `useRecordContext` pour résoudre la catégorie courante, boutons édition inline |
| **ModulePackPricesList** | `modulePackPrice/ModulePackPricesList.tsx` | Dashboard 2 sections : (1) paliers aéronefs par grille, (2) matrice packs × grilles avec prix, chips "Inclus" pour 0€, couleurs dynamiques `BRAND_COLORS` par slug, boutons créer/éditer inline |
| **ModulePacksEdit** | `modulePack/ModulePacksEdit.tsx` | Formulaire CRUD + composant `PricingTable` inline : reproduit le dashboard dans le contexte d'un seul pack, fetch croisé `pricing-categories` + `pricing-tiers` + `module-pack-prices`, affiche les paliers aéronefs et le prix du pack par grille |

### Packs de modules (configuration initiale)

| Pack | Modules (flags Client) | Par défaut |
|------|----------------------|------------|
| Base | *(fonctionnalités de base toujours actives)* | Oui |
| Réservations | `hasReservation`, `hasOptions`, `hasEmailConfirmation` | Non |
| Commerce | `hasGifts`, `hasWebshop`, `hasPartners` | Non |
| Passagers | `hasPassengerRegistration`, `hasOriginContact` | Non |
| Finances | `hasPaymentManagement`, `hasExpensesManagement` | Non |
| Tracking GPS | `hasMicrotrakTag` | Non |
| Avancé | `hasLandingManagement`, `hasIndividualFlightLogs`, `hasGroupUpdate` | Non |

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
- **AeronefQuotaSubscriber** — Validation quota aéronefs avant écriture (403 si dépassé)
- **ModulePackSyncSubscriber** — Recalcul flags `has*` quand les packs d'un Client changent

### Commandes CLI

- **`app:trial:expire`** — Suspend les comptes en trial expiré (cron quotidien)

### Sécurité

- Authentification **OIDC** via Keycloak (Bearer token)
- Hiérarchie de rôles : `OIDC_USER → ROLE_USER`, `OIDC_ADMIN → ROLE_ADMIN`
- **ClientTenantVoter** : vérifie `User.hasClient(entity.getClient())`
- **ROLE_SUPER_ADMIN** : accès à tous les tenants, bypass SubscriptionGuard
- **SubscriptionGuardListener** : bloque l'API si client `suspended`/`cancelled` (priority 5)
- Endpoint Wix sans auth (vérifié par HMAC)

---

## Frontend — PWA React-Admin

### Pages publiques

| Route | Fonction |
|-------|----------|
| `/` | Landing page "Planetair Gestion" — accès admin + message passagers |
| `/{slug}` | Formulaire inscription passager (RGPD) — résolution du client par slug URL |
| `/{slug}/thanks` | Page de remerciement personnalisée (affiche `thanksImage` + `thanksMessage` du client résolu) |
| `/admin` | Interface d'administration complète |
| `/auth/signin` | Redirection automatique vers Keycloak (plus de page MissingCSRF) |

### Résolution du tenant public (formulaire passager)

Le formulaire passager est accessible via `/{slug}` (ex: `/aix-ulm`, `/skyquest`).

**Flux complet** :
```
c6l.creazot.com/{slug}
  → [slug]/page.tsx (route dynamique Next.js)
  → GET /clients?slug={slug} → résolution client-side (filtrage par slug)
  → Si pas trouvé → page 404 personnalisée
  → Si hasPassengerRegistration = false → redirect /admin
  → Sinon → FormLayout (logo, nom, footer du client) + Form
  → POST /passagers (header X-Client-Id: {id})
  → TenantAssignSubscriber assigne le client automatiquement
  → Redirect → /{slug}/thanks?firstname={prenom}
```

**Champs hidden dans le formulaire** : `clientId` et `slug` (transmis via `formData` à `createPassenger`)

**Bouton rapide admin** : icône ↗ dans l'AppBar (visible si `client.slug` + `hasPassengerRegistration`), ouvre `/{slug}` dans un nouvel onglet

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
2. **Moteur de tarification SaaS** — Grilles dynamiques, paliers par aéronef, packs de modules, quota, trial, suspension, panel admin complet
3. **Architecture mature** — Stack API Platform complète, 32 entités, bien structurée
4. **Personnalisation client** — Entité Client riche (50+ champs, modules activables via packs)
5. **Images par client** — Stockage isolé `images/client/{id}/` avec fallback vers les defaults
6. **PDF personnalisés par client** — `PdfGenerator` utilise `client->getPdfBackground()` (fond PDF par client, fallback `Plane.png`), résolution du client via l'entité Cadeau (fonctionne en contexte HTTP et non-HTTP)
7. **Production optimisée** — PWA buildée en mode production (`next build` + `node server.js`), démarrage en 83ms, pages pré-compilées
8. **PWA installable** — `manifest.json` (standalone, icônes, start_url), métadonnées Apple Web App dans le layout
9. **Sécurité auth** — Secret NextAuth via variable d'environnement `AUTH_SECRET`, `getSession()` correctement awaité
10. **Zéro URL hardcodée** — `API_DOMAIN` résolu dynamiquement (`window.origin` / `NEXT_PUBLIC_ENTRYPOINT`), liens internes en relatif dans `FormLayout.tsx`
11. **Temps réel** — Mercure pour les mises à jour live
12. **Exports complets** — CSV/PDF pour 17 entités
13. **Intégrations** — Wix (bons cadeaux), Microtrak (GPS), METAR (météo)
14. **CI/CD robuste** — Tests automatisés, déploiement K8s
15. **Prêt pour Odoo** — Champs `odooCustomerId`/`odooSubscriptionId` sur Client (Phase 3)
16. **UX admin tarification** — Tableaux en matrices pleine page (Material-UI Table), colonnes = grilles tarifaires, lignes = paliers ou packs, prix en gros caractères avec boutons d'édition inline, ligne de simulation automatique, comparaison entre grilles (surlignage + atténuation), chips de remise, design cohérent sur les 4 pages (PricingTiers, PricingCategories, ModulePackPrices, ModulePacksEdit)

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

### ~~🟢 Mineurs — CORRIGÉS~~

8. ~~**Pas de vrai PWA**~~ → **Corrigé** : ajout d'un `manifest.json` dans `pwa/public/` (nom, icônes, `start_url: /admin`, `display: standalone`). Métadonnées PWA ajoutées dans `layout.tsx` via l'export `metadata` Next.js (`manifest`, `appleWebApp`). Le `<html lang>` est passé de `en` à `fr`.

9. ~~**Double config Tailwind**~~ → **Corrigé** : les éléments uniques de `tailwind.config.js` (couleurs `cyan`, config `container`, plugin `@tailwindcss/forms`) ont été fusionnés dans `tailwind.config.ts`. Le fichier `.js` a été supprimé.

10. ~~**Dépendances dupliquées**~~ → **Corrigé** : `react-query` (v3, inutilisé) supprimé de `package.json`. Seul `@tanstack/react-query` (v5) est conservé. Aucun import de l'ancien package n'existait dans le code.

### 🟡 Mineurs (dette technique restante)

11. **Deux libs de formulaires** — `formik` et `react-hook-form` coexistent dans les dépendances. Les formulaires devraient être unifiés sur une seule lib.

12. ~~**`ClientProvider.fetchClients()` sans auth**~~ → **Non-issue** : le endpoint `GET /clients` est volontairement public (`security` commenté sur l'`ApiResource`, seuls `Post`/`Put`/`Delete` requièrent `OIDC_ADMIN`). C'est nécessaire car la page publique `/thanks` (inscription passager) fait aussi un `fetch('/clients')`. Pas de header `Authorization` requis.

13. ~~**`pdfBackground` non utilisé dans la génération PDF**~~ → **Corrigé** : `PdfGenerator::generate()` résout le client depuis l'entité Cadeau (`$data->getClient()`) avec fallback sur `ClientGetter` (header HTTP). `getEncodedImage()` utilise `client->getPdfBackground()` pour charger l'image du client, avec fallback sur `Plane.png` partagé. Fonctionne en contexte HTTP et non-HTTP (CLI, workers).

---

## Prochaines étapes

### ~~Déploiement tarification (Phase 1) — TERMINÉ~~

- ~~Migration Doctrine~~ → schéma appliqué via `doctrine:schema:update --force`
- ~~Données initiales~~ → grilles "Tarif Public" et "FFPLUM -15%", 4 paliers chacune, 7 packs de modules, prix par pack×grille insérés en base
- ~~Panel admin complet~~ → 4 pages CRUD avec tableaux enrichis UX (matrices pleine page, comparaison entre grilles, simulations, chips, boutons inline)
- **Restant** : configurer `app:trial:expire` en cron quotidien sur le serveur

### Phase 2 — Données & Tests

- Fixtures/seed pour les grilles et packs par défaut
- Tests unitaires PricingCalculatorService
- Tests fonctionnels AeronefQuotaSubscriber

### Phase 3 — Intégration Odoo

- Webhook création client → Odoo (crée client + facture)
- Webhook paiement Odoo → app (active/suspend l'abonnement)
- Sync bidirectionnelle statut abonnement
