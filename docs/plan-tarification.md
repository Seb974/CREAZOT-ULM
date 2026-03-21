# Plan de développement — Moteur de tarification SaaS

## Modèle économique

**Tarification = Aéronefs × Palier + Modules optionnels - Remise maintenance**

### Grille tarifaire dynamique

Le super-admin peut créer des grilles tarifaires (ex: "Public", "FFPLUM", "Offre Été 2026")
avec des paliers par nombre d'aéronefs et des prix par module.

### Calcul de la facture mensuelle

```
Facture = (Nb aéronefs × tarif unitaire du palier)
        + (somme des packs de modules activés)
        - remise maintenance (10% par aéronef isAvailable=false)

Exemple : Club avec 3 aéronefs (1 en maintenance), grille Public, Pack Réservations
  Palier "3-5" → 60 €/aéronef/mois
  2 × 60,00 € = 120,00 €   (isAvailable = true)
  1 × 60,00 € × 0.90 = 54,00 €   (maintenance, -10%)
  Pack Réservations = 20,00 €
  TOTAL = 194,00 € /mois
```

### Décisions validées

| Question | Réponse |
|----------|---------|
| Facturation | Via Odoo (Phase 3). Manuel en Phase 1 |
| Recalcul palier automatique | Oui, sur POST/DELETE Aeronef |
| Aéronef en maintenance | Compte dans le palier, remise -10% |
| Découpage fonctionnel | Oui, packs de modules |
| Période d'essai | Oui, champ trialEndsAt |
| Suspension automatique | Oui, via Odoo (Phase 3) ou fin de trial |
| Intégration Odoo | Phase 3 — champs odooCustomerId/odooSubscriptionId prêts |

---

## Architecture : 4 nouvelles entités

### PricingCategory

Grille tarifaire nommée (ex: "FFPLUM", "Offre Été 2026")

| Champ | Type | Rôle |
|-------|------|------|
| id | int (auto) | PK |
| name | string(100) | "Tarif Public", "FFPLUM" |
| slug | string(50) | `public`, `ffplum` |
| description | text (nullable) | Description libre |
| discountPercent | float (nullable) | Remise globale vs référence (ex: 15%) |
| maintenanceDiscount | float | Remise aéronef en maintenance (ex: 10%) |
| isDefault | bool | Grille par défaut |
| isActive | bool | Visible / sélectionnable |
| validFrom | datetime (nullable) | Début validité (null = immédiat) |
| validUntil | datetime (nullable) | Fin validité (null = pas d'expiration) |
| createdAt | datetime | Auto |
| updatedAt | datetime | Auto |

### PricingTier

Palier tarifaire par nombre d'aéronefs, rattaché à une PricingCategory.

| Champ | Type | Rôle |
|-------|------|------|
| id | int (auto) | PK |
| pricingCategory | ManyToOne → PricingCategory | Grille parente |
| minAeronefs | int | Seuil minimum (inclus) |
| maxAeronefs | int (nullable) | Seuil maximum (inclus, null = illimité) |
| pricePerAeronef | float | Prix unitaire €/aéronef/mois |

### ModulePack

Pack de fonctionnalités regroupant des flags has* de Client.

| Champ | Type | Rôle |
|-------|------|------|
| id | int (auto) | PK |
| name | string(100) | "Pack Réservations" |
| slug | string(50) | `reservations` |
| description | text (nullable) | Description |
| modules | json | `["hasReservation", "hasOptions", "hasEmailConfirmation"]` |
| isDefault | bool | Inclus dans le tarif de base |
| sortOrder | int | Ordre d'affichage |

### ModulePackPrice

Prix d'un pack dans une grille tarifaire donnée.

| Champ | Type | Rôle |
|-------|------|------|
| id | int (auto) | PK |
| modulePack | ManyToOne → ModulePack | Pack concerné |
| pricingCategory | ManyToOne → PricingCategory | Grille tarifaire |
| monthlyPrice | float | Prix mensuel du pack |

### Client (champs ajoutés)

| Champ | Type | Rôle |
|-------|------|------|
| pricingCategory | ManyToOne → PricingCategory (nullable) | Grille tarifaire du client |
| modulePacks | ManyToMany → ModulePack | Packs activés |
| subscriptionStatus | string(20) | `trial`, `active`, `suspended`, `cancelled` |
| trialEndsAt | datetime (nullable) | Fin de la période d'essai |
| maxAeronefs | int (nullable) | Quota d'aéronefs (null = illimité) |
| monthlyBasePrice | float (nullable) | Tarif /aéronef calculé (cache pour affichage) |
| odooCustomerId | string(50) (nullable) | ID client Odoo (Phase 3) |
| odooSubscriptionId | string(50) (nullable) | ID abonnement Odoo (Phase 3) |

---

## Développement : 3 agents parallèles

### Agent 1 — Backend : Entités & API (5 tâches)

**Portée** : Création des 4 entités, mise à jour de Client, migration Doctrine.
**Fichiers créés/modifiés** :

| Fichier | Action |
|---------|--------|
| `api/src/Entity/PricingCategory.php` | Créer |
| `api/src/Entity/PricingTier.php` | Créer |
| `api/src/Entity/ModulePack.php` | Créer |
| `api/src/Entity/ModulePackPrice.php` | Créer |
| `api/src/Repository/PricingCategoryRepository.php` | Créer |
| `api/src/Repository/PricingTierRepository.php` | Créer |
| `api/src/Repository/ModulePackRepository.php` | Créer |
| `api/src/Repository/ModulePackPriceRepository.php` | Créer |
| `api/src/Entity/Client.php` | Modifier (7 nouveaux champs) |
| `api/migrations/VersionXXX.php` | Générer (doctrine:migrations:diff) |

**Détail des tâches** :

1. **PricingCategory** : entité API Platform, CRUD complet, sécurité `OIDC_ADMIN`
2. **PricingTier** : ManyToOne vers PricingCategory, cascade delete
3. **ModulePack** : champ `modules` en JSON, flag `isDefault`
4. **ModulePackPrice** : clé composite (pack × catégorie), contrainte unique
5. **Client** : 7 nouveaux champs, relation ManyToOne PricingCategory + ManyToMany ModulePack, migration

### Agent 2 — Backend : Logique métier (5 tâches)

**Portée** : Guards, calculs, synchronisation, commandes.
**Fichiers créés** :

| Fichier | Action |
|---------|--------|
| `api/src/EventSubscriber/AeronefQuotaSubscriber.php` | Créer |
| `api/src/Service/PricingCalculatorService.php` | Créer |
| `api/src/EventSubscriber/ModulePackSyncSubscriber.php` | Créer |
| `api/src/Command/TrialExpirationCommand.php` | Créer |
| `api/src/EventListener/SubscriptionGuardListener.php` | Créer |

**Détail des tâches** :

1. **AeronefQuotaSubscriber** — `KernelEvents::VIEW` / `POST_VALIDATE` sur Aeronef
   - Compte `aeronef WHERE client_id = X`
   - Compare avec `client.maxAeronefs`
   - Si >= quota → `throw new HttpException(403, "Quota atteint...")`
   - Sur POST réussi : trigger recalcul palier

2. **PricingCalculatorService** — Service injectable
   - `calculateMonthlyTotal(Client): array` → retourne détail facture
   - `findApplicableTier(PricingCategory, int $count): PricingTier`
   - `calculateMaintenanceDiscount(Client, PricingTier): float`
   - Met à jour `client.monthlyBasePrice` (cache)

3. **ModulePackSyncSubscriber** — `KernelEvents::VIEW` / `POST_WRITE` sur Client
   - Quand `client.modulePacks` change : recalcule les flags `has*`
   - Lit `modulePack.modules` (JSON) → set les booleans correspondants sur Client
   - Gère la désactivation (pack retiré → flags remis à false sauf si un autre pack les garde)

4. **TrialExpirationCommand** — Commande Symfony `app:trial:expire`
   - Sélectionne tous les clients avec `subscriptionStatus = 'trial'` et `trialEndsAt < now()`
   - Passe leur statut en `suspended`
   - Log les clients affectés
   - Prévu pour un cron quotidien

5. **SubscriptionGuardListener** — `KernelEvents::REQUEST`, priority 5
   - Si le client résolu a `subscriptionStatus = 'suspended'` ou `'cancelled'`
   - Retourne 403 `{"error": "Abonnement suspendu"}`
   - Exception : GET /clients (pour que le super-admin puisse toujours gérer)
   - Exception : super-admin bypass

### Agent 3 — Frontend : Panel Admin (5 tâches)

**Portée** : Interface React-Admin pour la gestion de la tarification.
**Fichiers créés/modifiés** :

| Fichier | Action |
|---------|--------|
| `pwa/components/admin/pricingCategory/` | Créer (index.ts, List, Create, Edit, Show) |
| `pwa/components/admin/pricingTier/` | Créer (index.ts, List, Create, Edit) |
| `pwa/components/admin/modulePack/` | Créer (index.ts, List, Create, Edit) |
| `pwa/components/admin/modulePackPrice/` | Créer (index.ts, List, Create, Edit) |
| `pwa/components/admin/subscription/` | Créer (SubscriptionDashboard.tsx) |
| `pwa/components/admin/Admin.tsx` | Modifier (ajouter les 4 resources) |
| `pwa/components/admin/layout/Menu.tsx` | Modifier (section "Tarification") |
| `pwa/components/admin/client/ClientsEdit.tsx` | Modifier (widget abonnement) |

**Détail des tâches** :

1. **CRUD PricingCategory + PricingTier**
   - PricingCategoriesList : cards avec nom, statut, nb paliers, dates validité
   - PricingCategoryEdit : formulaire + sous-liste éditable des PricingTiers
   - PricingTiersCreate inline dans PricingCategoryEdit (ReferenceManyField)

2. **CRUD ModulePack + ModulePackPrice**
   - ModulePacksList : nom, modules (chips), isDefault
   - ModulePackEdit : nom, description, sélecteur de modules (CheckboxGroupInput des flags has*)
   - ModulePackPrices inline : grille prix par catégorie (dans ModulePackEdit)

3. **SubscriptionDashboard** — Page `/admin/subscriptions`
   - Tableau récapitulatif : Client | Grille | Nb Aéro | Packs | Total | Statut
   - Filtres : statut (trial/active/suspended), grille tarifaire
   - KPI cards : nb clients actifs, MRR (Monthly Recurring Revenue), nb trials
   - Export CSV

4. **Menu + Admin.tsx**
   - Section "Tarification" dans le menu (super_admin uniquement)
   - Sous-menus : Grilles tarifaires, Packs, Abonnements
   - Enregistrement des 4 nouvelles resources dans Admin.tsx

5. **Widget abonnement dans ClientsEdit**
   - Bloc "Abonnement" dans le formulaire d'édition Client
   - Affiche : grille sélectionnée, packs activés (checkboxes), quota, statut, date trial
   - Compteur d'aéronefs actuels vs quota (barre de progression)
   - Estimation du tarif mensuel en temps réel

---

## Ordonnancement

```
         Temps ──────────────────────────────────────────────►

Agent 1  ████████████████████████████
         Entités + API + Migration
         (doit finir en premier pour que les API existent)

Agent 2       ░░░░████████████████████████████
              ↑   Logique métier
              attend que les entités soient commitées

Agent 3       ░░░░████████████████████████████████████
              ↑   Frontend React-Admin
              attend que les API endpoints existent
```

Agent 1 démarre en premier. Agents 2 et 3 démarrent dès que Agent 1 a terminé les entités.

---

## Packs de modules proposés (configuration initiale)

| Pack | Slug | Modules (flags Client) | Par défaut |
|------|------|----------------------|------------|
| Base | `base` | *(aucun flag — fonctionnalités de base toujours actives)* | ✅ Oui |
| Réservations | `reservations` | `hasReservation`, `hasOptions`, `hasEmailConfirmation` | Non |
| Commerce | `commerce` | `hasGifts`, `hasWebshop`, `hasPartners` | Non |
| Passagers | `passagers` | `hasPassengerRegistration`, `hasOriginContact` | Non |
| Finances | `finances` | `hasPaymentManagement`, `hasExpensesManagement` | Non |
| Tracking GPS | `tracking` | `hasMicrotrakTag` | Non |
| Avancé | `avance` | `hasLandingManagement`, `hasIndividualFlightLogs`, `hasGroupUpdate` | Non |

## Paliers par défaut (grille "Public")

| Min | Max | Prix/aéronef/mois |
|-----|-----|-------------------|
| 1 | 2 | 65 € |
| 3 | 5 | 60 € |
| 6 | 10 | 54 € |
| 11 | ∞ | 49 € |

## Paliers par défaut (grille "FFPLUM")

| Min | Max | Prix/aéronef/mois |
|-----|-----|-------------------|
| 1 | 2 | 55 € |
| 3 | 5 | 51 € |
| 6 | 10 | 46 € |
| 11 | ∞ | 42 € |

---

## Phases de déploiement

| Phase | Contenu | Quand |
|-------|---------|-------|
| **Phase 1** | Entités + API + Logique métier + Panel Admin | Maintenant |
| **Phase 2** | Données initiales (fixtures/seed), tests, déploiement prod | Après Phase 1 |
| **Phase 3** | Intégration Odoo (webhooks bidirectionnels, prélèvements) | Plus tard |
