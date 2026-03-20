-- =============================================================================
-- Migration Multi-Tenant — Assignation des données existantes au client 1
-- =============================================================================
-- À exécuter APRÈS la migration Doctrine (qui crée les colonnes client_id)
-- Pré-requis : au moins 1 client en base (id=1)
-- =============================================================================

BEGIN;

-- Vérification qu'un client existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM client WHERE id = 1) THEN
        RAISE EXCEPTION 'Aucun client avec id=1 trouvé. Créez un client avant cette migration.';
    END IF;
END $$;

-- =============================================================================
-- ÉTAPE 1 : Assigner client_id = 1 sur toutes les tables tenant-aware
-- =============================================================================

UPDATE aeronef SET client_id = 1 WHERE client_id IS NULL;
UPDATE prestation SET client_id = 1 WHERE client_id IS NULL;
UPDATE vol SET client_id = 1 WHERE client_id IS NULL;
UPDATE landing SET client_id = 1 WHERE client_id IS NULL;
UPDATE entretien SET client_id = 1 WHERE client_id IS NULL;

UPDATE reservation SET client_id = 1 WHERE client_id IS NULL;
UPDATE circuit SET client_id = 1 WHERE client_id IS NULL;
UPDATE option SET client_id = 1 WHERE client_id IS NULL;
UPDATE combinaison SET client_id = 1 WHERE client_id IS NULL;
UPDATE cadeau SET client_id = 1 WHERE client_id IS NULL;
UPDATE contact SET client_id = 1 WHERE client_id IS NULL;
UPDATE origine SET client_id = 1 WHERE client_id IS NULL;

UPDATE payment SET client_id = 1 WHERE client_id IS NULL;
UPDATE payment_detail SET client_id = 1 WHERE client_id IS NULL;
UPDATE expense SET client_id = 1 WHERE client_id IS NULL;
UPDATE passager SET client_id = 1 WHERE client_id IS NULL;
UPDATE rappel SET client_id = 1 WHERE client_id IS NULL;
UPDATE media_object SET client_id = 1 WHERE client_id IS NULL;

-- Airport et Camera sont déjà liés à un client

-- =============================================================================
-- ÉTAPE 2 : Rattacher tous les utilisateurs existants au client 1
-- =============================================================================

INSERT INTO user_client (user_id, client_id)
SELECT id, 1 FROM "user"
WHERE id NOT IN (SELECT user_id FROM user_client WHERE client_id = 1);

-- =============================================================================
-- ÉTAPE 3 : Passer client_id en NOT NULL (après vérification)
-- =============================================================================
-- Décommenter ces lignes une fois la migration validée en environnement de test

-- ALTER TABLE aeronef ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE prestation ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE vol ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE landing ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE entretien ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE reservation ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE circuit ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE option ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE combinaison ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE cadeau ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE contact ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE origine ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE payment ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE payment_detail ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE expense ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE passager ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE rappel ALTER COLUMN client_id SET NOT NULL;
-- ALTER TABLE media_object ALTER COLUMN client_id SET NOT NULL;

COMMIT;

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================
-- SELECT 'aeronef' as tbl, count(*) as total, count(client_id) as with_client FROM aeronef
-- UNION ALL SELECT 'prestation', count(*), count(client_id) FROM prestation
-- UNION ALL SELECT 'vol', count(*), count(client_id) FROM vol
-- UNION ALL SELECT 'user_client', count(*), count(*) FROM user_client;
