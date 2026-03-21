#!/bin/bash
# ============================================
# C6L - Guide Utilisateur - Script de déploiement
# ============================================
# Cible : VPS OVH (104.248.141.236)
# URL   : https://creazot.com/
# Nginx : /var/www/docs-c6l/
# ============================================

set -e

# --- Configuration ---
VPS_HOST="104.248.141.236"
VPS_USER="root"
REMOTE_PATH="/var/www/docs-c6l/"
LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)/"

echo "=========================================="
echo "  C6L - Déploiement Guide Utilisateur"
echo "=========================================="
echo ""
echo "  Source  : $LOCAL_PATH"
echo "  Cible   : $VPS_USER@$VPS_HOST:$REMOTE_PATH"
echo "  URL     : https://creazot.com/"
echo ""

# --- Upload des fichiers ---
echo "📤 Upload des fichiers..."
rsync -avz --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  "$LOCAL_PATH" \
  "$VPS_USER@$VPS_HOST:$REMOTE_PATH" \
  --exclude='deploy.sh' \
  --exclude='README.md'

echo ""

# --- Reload Nginx ---
echo "🔄 Rechargement Nginx..."
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "systemctl reload nginx"

echo ""
echo "✅ Déploiement terminé !"
echo "🌐 https://creazot.com/"
echo ""
