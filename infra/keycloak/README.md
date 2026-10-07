# Keycloak (authentification admin)

Le realm `minimarket` est importé automatiquement au démarrage du compose (`minimarket-realm.json`).

| Élément | Valeur |
|---|---|
| Console Keycloak | http://localhost:8180 (admin / admin) |
| Compte admin boutique | `admin` / `admin` (rôle realm `admin`) |
| Client front | `minimarket-front` (public, PKCE S256) |
| Client de test | `minimarket-dev-cli` : **DEV uniquement**, password grant pour tester les API avec `curl` |

**Dev seulement** : mots de passe triviaux, HTTP, `start-dev`. Avant toute exposition réelle : changer les mots de passe, supprimer `minimarket-dev-cli`, passer en HTTPS et en base persistante.

Les services (`catalog-service`, `order-service`) vérifient la signature des jetons via les clés publiques du realm (JWKS) et lisent le rôle dans `realm_access.roles`. L'émetteur (`iss`) et l'audience ne sont pas vérifiés pour l'instant.

Obtenir un jeton pour tester l'API :

```bash
TOKEN=$(curl -s -d "client_id=minimarket-dev-cli&grant_type=password&username=admin&password=admin" \
  http://localhost:8180/realms/minimarket/protocol/openid-connect/token | jq -r .access_token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8082/admin/stats
```

Créer un autre administrateur : console Keycloak → realm `minimarket` → Users → Role mapping → `admin`.
