---
name: relancer-stack
description: Reconstruire et relancer la stack MiniMarket en local (services Docker modifiés, attente de leur santé, serveur de dev Angular avec proxy). À utiliser après une modification backend, du compose ou du proxy.
---

# Relancer la stack locale

## Backend (Docker)

```bash
bash .claude/skills/relancer-stack/relancer.sh order-service catalog-service
```

Sans argument : tout reconstruire. Le script attend `/actuator/health` (jusqu'à environ 3 min par service) et retourne un code non nul en cas d'échec. En cas de `KO`, lire `docker logs <service>`.

Si Docker ne répond pas, demander à l'utilisateur de lancer Docker Desktop.

## Front (Angular)

Le proxy (`proxy.conf.json`) n'est lu **qu'au démarrage** : le relancer après toute modification.

1. Libérer le port 4200 (PowerShell) :
   `Get-NetTCPConnection -LocalPort 4200 -State Listen -ErrorAction SilentlyContinue | % { Stop-Process -Id $_.OwningProcess -Force }`
2. Démarrer **en arrière-plan** depuis `frontend/minimarket-front` :
   `npx ng serve --proxy-config proxy.conf.json --port 4200`
3. Vérifier : `curl -s -o /dev/null -w '%{http_code}' localhost:4200/` doit afficher 200, et la sortie ne doit pas contenir `ERROR`.

## Pièges connus

- `npm start` seul ne charge **pas** le proxy : toujours passer `--proxy-config`.
- Après une réoptimisation Vite (nouvelle dépendance npm), le serveur peut planter avec « new version of the pre-bundle » : le relancer.
- Un `ng serve` « terminé » en tâche de fond après un arrêt volontaire est normal.
- Ports : front 4200, catalogue 8081, commandes 8082, Keycloak 8180, Kafka 9092, Postgres commandes 5433.
