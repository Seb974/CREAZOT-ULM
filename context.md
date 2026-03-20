# C6L / Planetair Gestion 4.0 — Contexte technique

## Architecture globale

Le projet repose sur la distribution **API Platform** avec une architecture en 4 services Docker :

```
┌──────────────────────────────────────────────────────┐
│  PWA (Next.js 14)  ←→  API (Symfony 7 / FrankenPHP) │
│         ↕                        ↕                   │
│    Keycloak (OIDC)         PostgreSQL 16              │
└──────────────────────────────────────────────────────┘
```

| Composant | Stack |
|-----------|-------|
| **Backend** | Symfony 7.1, PHP 8.3, API Platform 4.0, Doctrine ORM |
| **Frontend** | Next.js 14, React 18, TypeScript, React-Admin |
| **Auth** | Keycloak (OIDC/JWT), NextAuth v5 |
| **BDD** | PostgreSQL 16.4 |
| **Temps réel** | Mercure |
| **Déploiement** | Docker Compose / Kubernetes (Helm) / GKE |
| **CI/CD** | GitHub Actions, Playwright (E2E), k6 (charge) |

---

## Backend — 28 entités métier

Le domaine couvre la gestion complète d'une base ULM.

### Coeur métier

| Entité | Rôle |
|--------|------|
| **Client** | Multi-tenant : logo, couleurs, modules activés, GPS |
| **User** | Utilisateurs liés à Keycloak (UUID, rôles OIDC) |
| **ProfilPilote** | Profil pilote, heures de vol, disponibilité |
| **Aeronef** | Immatriculation, horamètre, seuil alerte, balise |
| **Prestation** | Session de vol (durée, horamètre départ/fin, CA) |
| **Vol** | Détail vol (quantité, durée, prix, coût) |
| **Landing** | Atterrissages (code OACI, touchés, complets) |
| **CarnetVol** | Carnet de vol pilote (date, durée, lieux) |

### Réservations & Commerce

| Entité | Rôle |
|--------|------|
| **Reservation** | Réservation client (statut, paiement, code) |
| **Circuit** | Type de vol (nom, prix, durée, avec options) |
| **Option / Combinaison** | Options tarifaires |
| **Cadeau** | Bons cadeaux (code, validité, intégration Wix) |
| **Contact / Origine** | Sources et contacts |
| **Passager** | Inscription RGPD passagers |

### Finances & Maintenance

| Entité | Rôle |
|--------|------|
| **Payment / PaymentDetail** | Paiements multi-modes |
| **Expense** | Dépenses (liées ou non à la maintenance) |
| **Entretien** | Maintenance aéronef (horamètre, intervenants) |
| **Qualification** | Qualifications pilote (validité, alertes) |
| **CertificatMedical** | Certificats médicaux (type, validité) |
| **Disponibilite** | Créneaux de disponibilité pilote |

### Support

| Entité | Rôle |
|--------|------|
| **Airport** | Aérodromes (code, météo, caméras) |
| **Camera** | Caméras terrain |
| **Rappel** | Rappels/alertes planifiées |
| **MediaObject** | Fichiers uploadés (photos, documents) |
| **Nature** | Types de vol (code, label) |

---

## Backend — Logique métier clé

### Contrôleurs spécialisés

- **ExportController** — Exports CSV/PDF (17 entités exportables)
- **ShopController** — Webhook Wix (achat bons cadeaux, vérification HMAC)
- **CadeauController** — Téléchargement PDF bons cadeaux
- **MicrotrakProxyController** — Proxy GPS tracking en vol

### Event Subscribers (logique auto)

- **PrestationCreateSubscriber** — Mise à jour horamètre, calcul coûts, alertes maintenance, création carnet de vol
- **PaymentSubscriber** — Marquage automatique des réservations payées
- **CarnetVolEditSubscriber** — Ajout heures de vol au profil pilote
- **EntitiesMetaSubscriber** — Timestamps créé/modifié sur les entités

### Sécurité

- Authentification **OIDC** via Keycloak (Bearer token)
- Hiérarchie de rôles : `OIDC_USER → ROLE_USER`, `OIDC_ADMIN → ROLE_ADMIN`
- Endpoint Wix sans auth (vérifié par HMAC)
- 4 Voters personnalisés pour les permissions

---

## Frontend — PWA React-Admin

### Pages publiques

| Route | Fonction |
|-------|----------|
| `/` | Formulaire inscription passager (RGPD) |
| `/thanks` | Page de remerciement |
| `/admin` | Interface d'administration complète |

### Interface Admin (React-Admin)

**35+ modules CRUD** couvrant toutes les entités, avec :

- Listes, création, édition, détail pour chaque ressource
- **Dashboard** avec :
  - Météo METAR/TAF temps réel
  - Carte Leaflet (aérodromes, GPS)
  - Graphiques ApexCharts
  - Caméras terrain
  - Calendrier de réservations
- Gestion multi-client (sélection et branding dynamique)
- Internationalisation FR/EN

### Stack UI

- **Tailwind CSS** + **Material UI** + **NextUI**
- Polices Poppins / Satoshi / Inter
- Animations Framer Motion

---

## Infrastructure & DevOps

### Docker Compose (3 profils)

- **dev** — Hot reload, Xdebug, ports exposés
- **prod** — Images optimisées, pas de source mount
- **e2e** — Keycloak HTTPS + Playwright

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

---

## Multi-tenant — Analyse approfondie

### Constat : single-tenant avec couche de personnalisation

Le système est structuré autour d'une entité `Client` riche, mais fonctionne en **mono-tenant**.

### Résolution du client (backend)

Le service `ClientGetter` retourne toujours le **premier client en base** (par `id` croissant) :

```php
// api/src/Service/ClientGetter.php
public function get(): ?Client
{
    $clients = $this->em->getRepository(Client::class)->findBy([], ['id' => 'ASC']);
    return $clients[0];
}
```

Aucune résolution par sous-domaine, header HTTP, claim JWT ou paramètre de requête.

### Isolation des données

Seules **2 entités sur 28** ont une relation `ManyToOne → Client` :

| Entité liée | Les autres (non liées) |
|-------------|------------------------|
| **Airport**, **Camera** | Prestation, Vol, Reservation, Aeronef, Pilote, Payment, Expense, Entretien, Circuit, Cadeau, etc. |

- Pas de filtre Doctrine global par tenant
- Pas de query extension par client
- Pas de voter vérifiant l'appartenance à un tenant
- Les users ne sont pas rattachés à un client

### Isolation des données existante (par utilisateur)

Le filtrage existant est par **utilisateur/pilote**, pas par client :

| Extension | Entité | Règle |
|-----------|--------|-------|
| `VolQueryCollectionExtension` | Vol | Non-admin : `prestation.pilote = :user` |
| `PrestationQueryCollectionExtension` | Prestation | Non-admin : `pilote = :user` |
| `CarnetVolQueryCollectionExtension` | CarnetVol | Toujours : `profil.pilote = :user` |
| `ProfilPiloteQueryCollectionExtension` | ProfilPilote | Non-admin : `pilote = :user` |
| `UserQueryCollectionExtension` | User | Non-admin : `root = :user` |

### Utilisation du ClientGetter

| Service | Usage |
|---------|-------|
| `PdfGenerator` | Logo/fond pour les bons cadeaux PDF |
| `DynamicMailerFactory` | DSN mailer par client |
| `ExportUtils` | URL média pour les exports |
| `AirportEditionSubscriber` | `setClient()` sur nouvel aéroport |
| `CameraEditionSubscriber` | `setClient()` sur nouvelle caméra |

### Frontend — client pour le branding

Le `ClientProvider` (React Context + sessionStorage) charge le premier client et l'utilise pour :

| Élément | Champs client utilisés |
|---------|------------------------|
| **AppBar** | `logo`, `color` |
| **Menu** | `hasReservation`, `hasGifts`, `hasLandingManagement`, `hasPaymentManagement`, `hasExpensesManagement`, `hasMicrotrakTag`, `hasWebshop` |
| **Formulaire passager** | `hasPassengerRegistration`, `consentText`, `thanksTitle`, `thanksMessage` |
| **Carte / Dashboard** | `lat`, `lng`, `zoom`, `mapIcon`, `color` |
| **E-mails** | `emailServer`, `emailAddressSender`, `confirmationSubject`, `confirmationMessage` |

Pas de sélecteur de client dans l'interface. Le "switch" se fait en éditant un client dans le CRUD admin.

### Entité Client — 40+ champs de configuration

| Catégorie | Champs |
|-----------|--------|
| **Identité** | `name`, `slug`, `email`, `phone`, `address`, `city`, `zipcode`, `website`, `url` |
| **Branding** | `logo`, `favicon`, `color`, `opacity`, `mapIcon`, `pdfBackground`, `thanksImage` |
| **Géolocalisation** | `lat`, `lng`, `zoom`, `timezone` |
| **Modules activables** | `hasReservation`, `hasPassengerRegistration`, `hasOptions`, `hasPartners`, `hasGifts`, `hasLandingManagement`, `hasPaymentManagement`, `hasExpensesManagement`, `hasMicrotrakTag`, `hasWebshop`, `hasIndividualFlightLogs`, `hasGroupUpdate`, `useAvailabilityFilter`, `hasOriginContact`, `hasEmailConfirmation` |
| **Alertes** | `seuilMedical`, `seuilQualifications` (jours avant expiration) |
| **Horaires** | `minHours`, `maxHours` |
| **E-mail** | `emailServer`, `emailAddressSender`, `confirmationSubject`, `confirmationMessage` |
| **Passagers** | `consentText`, `thanksTitle`, `thanksMessage` |

### Bilan multi-tenant

```
┌─────────────────────────────────────────────────┐
│           ÉTAT ACTUEL : SINGLE-TENANT           │
│                                                 │
│  Client = configuration de l'instance           │
│  Pas d'isolation des données par client         │
│  Pas de résolution dynamique du tenant          │
│  2/28 entités liées à Client                    │
│                                                 │
├─────────────────────────────────────────────────┤
│     CE QUI EXISTE POUR ÉVOLUER VERS MULTI       │
│                                                 │
│  ✅ Entité Client riche (40+ champs)            │
│  ✅ ClientGetter injectable (à enrichir)        │
│  ✅ Architecture API Platform extensible        │
│  ✅ Keycloak multi-realm possible               │
│                                                 │
├─────────────────────────────────────────────────┤
│     CE QU'IL FAUDRAIT POUR UN VRAI MULTI        │
│                                                 │
│  ❌ ManyToOne Client sur toutes les entités     │
│  ❌ Filtre Doctrine global par tenant           │
│  ❌ Résolution client (subdomain/header/JWT)    │
│  ❌ Sélecteur client dans le frontend           │
│  ❌ Isolation sécurité (Voters par tenant)      │
└─────────────────────────────────────────────────┘
```

---

## Points forts

1. **Architecture mature** — Stack API Platform complète, bien structurée
2. **Personnalisation client** — Entité Client riche (40+ champs, modules activables)
3. **72% de couverture CDC FFPLUM** — Base solide pour l'adaptation
4. **Temps réel** — Mercure pour les mises à jour live
5. **Exports complets** — CSV/PDF pour 17 entités
6. **Intégrations** — Wix (bons cadeaux), Microtrak (GPS), METAR (météo)
7. **CI/CD robuste** — Tests automatisés, déploiement K8s

## Points d'attention

1. **Single-tenant** — Pas d'isolation des données par client, `ClientGetter` retourne toujours le premier client
2. **URL hardcodée** dans `app/lib/api.ts` → `https://admin.planetair974.re`
3. **Bug page d'accueil** — `data[0]` au lieu de `data['hydra:member'][0]` (format Hydra)
4. **Favicon non appliqué** — Stocké dans le modèle mais jamais injecté dans le `<head>`
5. **Pas de vrai PWA** — Pas de manifest.json ni service worker dans le code
6. **Double config Tailwind** — `tailwind.config.js` et `tailwind.config.ts`
7. **Dépendances dupliquées** — `react-query` et `@tanstack/react-query` coexistent
8. **Deux libs de formulaires** — `formik` + `react-hook-form` en parallèle
