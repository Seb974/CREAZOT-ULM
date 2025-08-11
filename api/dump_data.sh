#!/bin/bash

# Variables d'environnement (tu peux les adapter ou les mettre dans un .env)
PGUSER="${POSTGRES_USER:-app}"
PGPASSWORD="${POSTGRES_PASSWORD:-!ChangeMe!}"
PGHOST="localhost"  # Pas utilisé par docker exec, donc peu important ici
PGPORT=5432         # idem
PGDATABASE="${POSTGRES_DB:-app}"

# Répertoire local sur la machine hôte pour stocker les dumps
LOCAL_DUMP_DIR="../dump"

# Crée le dossier si besoin
mkdir -p "$LOCAL_DUMP_DIR"

# Supprimer les dumps de plus de 7 jours
find "$LOCAL_DUMP_DIR" -type f -name "dump_data_*.sql" -mtime +7 -exec rm -f {} \;

# Nom du fichier dump avec timestamp
FILENAME="dump_data_$(date +'%Y%m%d_%H%M%S').sql"

echo "Début du dump dans $LOCAL_DUMP_DIR/$FILENAME"

# Exécute pg_dump dans le container 'database' via docker compose exec,
# et redirige la sortie vers le fichier sur la machine hôte
docker compose exec database pg_dump -U "$PGUSER" -d "$PGDATABASE" --data-only > "$LOCAL_DUMP_DIR/$FILENAME"

# Vérification du succès
if [ $? -eq 0 ]; then
  echo "Dump des données effectué avec succès dans $LOCAL_DUMP_DIR/$FILENAME"
else
  echo "Erreur lors du dump des données."
  exit 1
fi

