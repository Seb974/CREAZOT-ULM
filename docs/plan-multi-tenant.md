# Plan de migration Multi-Tenant — C6L / Planetair Gestion 4.0

> Date : 20 mars 2026
> Statut : ✅ Implémenté — en attente de migration Doctrine et tests

---

## Décisions d'architecture

### Résolution du tenant
- **Header `X-Client-Id`** envoyé par le frontend à chaque requête API
- Backend lit le header, valide l'appartenance de l'utilisateur, active le filtre Doctrine
- Super-admin sans header → vue fédérale (toutes les données)

### Relation User ↔ Client
- **ManyToMany** via table pivot `user_client`
- Un utilisateur peut appartenir à plusieurs clubs
- Chargement du premier client par défaut à la connexion

### Rôles
- **Globaux** issus de Keycloak (pas de rôle par client)
- `ROLE_SUPER_ADMIN` → accès tous les clients + vue fédérale
- `OIDC_ADMIN` → admin dans ses clients uniquement
- `OIDC_USER` → pilote dans ses clients uniquement

### Classification des entités

#### Entités globales (pas de client_id) — 8

| Entité | Justification |
|--------|---------------|
| User | Compte utilisateur transversal |
| ProfilPilote | 1 profil pilote, N clubs |
| CarnetVol | Historique de vol global |
| CertificatMedical | Valable partout |
| Qualification | Référentiel partagé |
| PilotQualification | Qualification du pilote (global) |
| Nature | Référentiel types de vol |
| Disponibilite | Disponibilité pilote (global) |

#### Entités par tenant (client_id NOT NULL) — 20

| Entité | Déjà liée ? |
|--------|-------------|
| Airport | ✅ Déjà lié |
| Camera | ✅ Déjà lié |
| Aeronef | ✅ Fait — TenantAwareTrait |
| Prestation | ✅ Fait — TenantAwareTrait |
| Vol | ✅ Fait — TenantAwareTrait |
| Landing | ✅ Fait — TenantAwareTrait |
| Reservation | ✅ Fait — TenantAwareTrait |
| Circuit | ✅ Fait — TenantAwareTrait |
| Option | ✅ Fait — TenantAwareTrait |
| Combinaison | ✅ Fait — TenantAwareTrait |
| Cadeau | ✅ Fait — TenantAwareTrait |
| Payment | ✅ Fait — TenantAwareTrait |
| PaymentDetail | ✅ Fait — TenantAwareTrait |
| Expense | ✅ Fait — TenantAwareTrait |
| Entretien | ✅ Fait — TenantAwareTrait |
| Contact | ✅ Fait — TenantAwareTrait |
| Origine | ✅ Fait — TenantAwareTrait |
| Passager | ✅ Fait — TenantAwareTrait |
| Rappel | ✅ Fait — TenantAwareTrait |
| MediaObject | ✅ Fait — TenantAwareTrait |

---

## Chantiers techniques

### Chantier 1 — Modèle de données ✅
- [x] Créer l'interface `TenantAwareInterface` et le trait `TenantAwareTrait`
- [x] Table pivot `user_client` (ManyToMany User ↔ Client)
- [x] Ajouter `client_id` (ManyToOne → Client) sur les 18 entités non liées
- [ ] Migration Doctrine (`php bin/console doctrine:migrations:diff`)
- [x] Script d'assignation des données existantes → `migrations/multi-tenant-migration.sql`

### Chantier 2 — Filtre Doctrine tenant ✅
- [x] `ClientTenantFilter` → `src/Doctrine/Orm/Filter/ClientTenantFilter.php`
- [x] `TenantFilterListener` → `src/EventListener/TenantFilterListener.php`
- [x] `ClientGetter` enrichi → `src/Service/ClientGetter.php` (lit `X-Client-Id`)
- [x] Assignation auto `client_id` sur POST → `src/EventSubscriber/TenantAssignSubscriber.php`

### Chantier 3 — Sécurité ✅
- [x] `ClientTenantVoter` → `src/Security/Voter/ClientTenantVoter.php`
- [x] Bypass super-admin (`ROLE_SUPER_ADMIN`)
- [ ] Intégrer le voter dans les opérations API Platform (security attributes)

### Chantier 4 — Frontend ✅
- [x] Composant `ClientSelector` → `pwa/components/admin/ClientSelector.jsx`
- [x] Intégré dans `AppBar.tsx`
- [x] Header `X-Client-Id` injecté dans `dataAccess.ts`
- [x] `ClientProvider` mis à jour (multi-clients, `switchClient()`)
- [x] Option "Vue fédérale" pour super-admin

### Chantier 5 — Migration données existantes
- [x] Script SQL créé → `migrations/multi-tenant-migration.sql`
- [ ] Exécuter la migration Doctrine
- [ ] Exécuter le script SQL de données
- [ ] Passer `client_id` en NOT NULL
- [ ] Tests de non-régression

---

## Ordre d'exécution

```
✅ Pré-requis : TenantAwareInterface + TenantAwareTrait (fondation commune)
     │
     ├── ✅ Agent 1 : Entités Vol & Flotte (5 entités)
     ├── ✅ Agent 2 : Entités Commerce & Réservations (7 entités)
     ├── ✅ Agent 3 : Entités Finance & Support + User pivot (6 entités + pivot)
     └── ✅ Agent 4 : Infrastructure backend + Frontend
     │
     ▼
⏳ Migration Doctrine + Script SQL + Tests
```

---

## Fichiers créés / modifiés

### Fichiers créés (7)

| Fichier | Rôle |
|---------|------|
| `api/src/Entity/TenantAwareInterface.php` | Interface multi-tenant |
| `api/src/Entity/TenantAwareTrait.php` | Trait avec `ManyToOne → Client` |
| `api/src/Doctrine/Orm/Filter/ClientTenantFilter.php` | Filtre SQL Doctrine par tenant |
| `api/src/EventListener/TenantFilterListener.php` | Active le filtre sur chaque requête |
| `api/src/EventSubscriber/TenantAssignSubscriber.php` | Auto-assign `client_id` sur POST |
| `api/src/Security/Voter/ClientTenantVoter.php` | Vérifie accès user → client |
| `pwa/components/admin/ClientSelector.jsx` | Sélecteur de client dans l'AppBar |

### Entités modifiées (18) — ajout `implements TenantAwareInterface` + `use TenantAwareTrait`

Aeronef, Prestation, Vol, Landing, Entretien, Reservation, Circuit, Option, Combinaison, Cadeau, Contact, Origine, Payment, PaymentDetail, Expense, Passager, Rappel, MediaObject

### Entités modifiées (2) — pivot ManyToMany

| Fichier | Modification |
|---------|-------------|
| `User.php` | `ManyToMany → Client` + `user_client` pivot + `getClients()`, `hasClient()` |
| `Client.php` | Inverse `ManyToMany → User` + `getUsers()`, `addUser()`, `removeUser()` |

### Fichiers modifiés (4)

| Fichier | Modification |
|---------|-------------|
| `api/src/Service/ClientGetter.php` | Lit `X-Client-Id` header, fallback premier client |
| `api/config/packages/doctrine.yaml` | Filtre `client_tenant` ajouté |
| `pwa/components/admin/ClientProvider.jsx` | Multi-clients, `switchClient()` |
| `pwa/components/admin/layout/AppBar.tsx` | `<ClientSelector />` intégré |
| `pwa/utils/dataAccess.ts` | Header `X-Client-Id` injecté |

---

## Prochaines étapes

1. **Générer la migration Doctrine** : `php bin/console doctrine:migrations:diff`
2. **Appliquer la migration** : `php bin/console doctrine:migrations:migrate`
3. **Exécuter le script SQL** : `migrations/multi-tenant-migration.sql`
4. **Décommenter les contraintes NOT NULL** dans le script SQL
5. **Injecter le header `X-Client-Id` dans `fetchHydra`** (React-Admin data provider)
6. **Tester** : créer un 2e client, affecter des données, vérifier l'isolation
