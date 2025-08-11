#!/bin/bash

# Se placer dans le dossier du script, puis dans le dossier racine du projet
cd "$(dirname "$0")" || exit 1
cd ../.. || exit 1

# Variables d'environnement
PGUSER="${POSTGRES_USER:-app}"
PGPASSWORD="${POSTGRES_PASSWORD:-!ChangeMe!}"
PGHOST="localhost"
PGPORT=5432
PGDATABASE="${POSTGRES_DB:-app}"

# Répertoire local pour stocker les dumps (chemin absolu)
LOCAL_DUMP_DIR="$(pwd)/dump"

# Crée le dossier si besoin
mkdir -p "$LOCAL_DUMP_DIR"

# Supprimer les dumps de plus de 7 jours
find "$LOCAL_DUMP_DIR" -type f -name "dump_data_*.sql" -mtime +7 -exec rm -f {} \;

# Nom du fichier dump avec timestamp
FILENAME="dump_data_$(date +'%Y%m%d_%H%M%S').sql"

echo "Début du dump dans $LOCAL_DUMP_DIR/$FILENAME"

# Exécute pg_dump dans le container 'database'
docker compose exec database pg_dump -U "$PGUSER" -d "$PGDATABASE" --data-only > "$LOCAL_DUMP_DIR/$FILENAME"

# Vérification du succès
if [ $? -eq 0 ]; then
  echo "Dump des données effectué avec succès dans $LOCAL_DUMP_DIR/$FILENAME"
else
  echo "Erreur lors du dump des données."
  exit 1
fi