#!/bin/bash
set -e

# Choix du mode via variable d'environnement
# Dev par défaut, prod si KEYCLOAK_MODE=prod
if [ "${KEYCLOAK_MODE}" = "prod" ]; then
  echo "Starting Keycloak in production mode..."
  exec /opt/keycloak/bin/kc.sh start --hostname-strict
else
  echo "Starting Keycloak in dev mode..."
  exec /opt/keycloak/bin/kc.sh start-dev
fi
