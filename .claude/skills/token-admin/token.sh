#!/usr/bin/env bash
# Affiche un jeton d'accès Keycloak (realm minimarket) sur stdout. DEV uniquement.
# Usage: token.sh [utilisateur] [mot_de_passe]   (défaut: admin / admin)
set -euo pipefail
USER_NAME="${1:-admin}"
PASSWORD="${2:-admin}"
KEYCLOAK="${KEYCLOAK_URL:-http://localhost:8180}"

RESPONSE=$(curl -sf -d "client_id=minimarket-dev-cli&grant_type=password&username=${USER_NAME}&password=${PASSWORD}" \
  "${KEYCLOAK}/realms/minimarket/protocol/openid-connect/token") \
  || { echo "Échec: Keycloak injoignable ou identifiants invalides" >&2; exit 1; }

printf '%s' "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])"
