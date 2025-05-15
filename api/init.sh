#!/bin/sh
set -e

echo "🔄 Copie des images de référence dans le dossier partagé..."

# Copier récursivement, écraser uniquement si fichier plus récent dans source
cp -ru /srv/assets/default-images/. /srv/api/public/images/

echo "✅ Copie terminée. Lancement de FrankenPHP..."

exec frankenphp run --config /etc/caddy/Caddyfile
