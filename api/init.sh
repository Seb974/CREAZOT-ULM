#!/bin/sh
set -e

echo "📁 🔄 Copie des images de référence dans le dossier partagé..."

# Copier récursivement, écraser uniquement si le fichier source est plus récent
cp -ru /srv/assets/default-images/. /srv/api/public/images/

echo "✅ Copie des images terminée."

# 💡 Attente que PostgreSQL soit disponible
echo "⏳ Attente que PostgreSQL soit disponible..."
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
until pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL est prêt."

# ⚙️ Exécuter les migrations
echo "📦 Lancement des migrations Doctrine..."
php bin/console doctrine:migrations:migrate --no-interaction || echo "WARNING: Migrations had issues, continuing startup..."

# 🌱 Initialiser les données si la base est vide
echo "🌱 Initialisation des données de référence..."
php bin/console app:data:initialize

echo "✅ Données initialisées. Lancement de FrankenPHP..."

# 🚀 Démarrage de FrankenPHP
exec frankenphp run --config /etc/caddy/Caddyfile
