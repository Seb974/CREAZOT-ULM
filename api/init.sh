#!/bin/sh
set -e

echo "📁 🔄 Copie des images de référence dans le dossier partagé..."

# Copier récursivement, écraser uniquement si le fichier source est plus récent
cp -ru /srv/assets/default-images/. /srv/api/public/images/

echo "✅ Copie des images terminée."

# 💡 Facultatif : attendre que la base PostgreSQL soit prête (décommenter si utile)
echo "⏳ Attente que PostgreSQL soit disponible..."
until pg_isready -h database -p 5432 -U $POSTGRES_USER > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL est prêt."

# ⚙️ Exécuter les migrations
echo "📦 Lancement des migrations Doctrine..."
php bin/console doctrine:migrations:migrate --no-interaction

# 🌱 Initialiser les données si la base est vide
echo "🌱 Initialisation des données de référence..."
php bin/console app:data:initialize

echo "✅ Données initialisées. Lancement de FrankenPHP..."

# 🚀 Démarrage de FrankenPHP
exec frankenphp run --config /etc/caddy/Caddyfile
