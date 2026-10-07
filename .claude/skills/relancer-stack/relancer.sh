#!/usr/bin/env bash
# Reconstruit et relance des services du compose, puis attend qu'ils répondent sur /actuator/health.
# Usage: relancer.sh [service ...]   (sans argument: tous les services)
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT/infra/compose"

docker info >/dev/null 2>&1 || { echo "Docker ne répond pas: lancer Docker Desktop" >&2; exit 1; }

docker compose up -d --build --remove-orphans "$@" || { echo "Échec du build/démarrage" >&2; exit 1; }

# service -> port publié (seuls ceux-là sont testables depuis l'hôte)
declare -A PORTS=([catalog-service]=8081 [order-service]=8082 [user-service]=8084)
targets=("$@"); [ ${#targets[@]} -eq 0 ] && targets=("${!PORTS[@]}")

status=0
for svc in "${targets[@]}"; do
  port="${PORTS[$svc]:-}"
  [ -z "$port" ] && continue
  ok=0
  for _ in $(seq 1 40); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' "localhost:${port}/actuator/health")" = 200 ] && { ok=1; break; }
    sleep 5
  done
  if [ $ok -eq 1 ]; then echo "OK   $svc (:$port)"; else echo "KO   $svc (:$port) : voir 'docker logs $svc'" >&2; status=1; fi
done
exit $status
