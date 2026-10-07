---
name: token-admin
description: Obtenir un jeton Keycloak et appeler les API protégées de MiniMarket avec curl (routes /admin, écriture catalogue). À utiliser pour tester la sécurité ou une route admin en ligne de commande.
---

# Jeton Keycloak pour tester l'API

Prérequis : le compose tourne (Keycloak sur `localhost:8180`). Client de test **DEV uniquement** : `minimarket-dev-cli`.

## Étapes

1. Jeton admin : `TOKEN=$(bash .claude/skills/token-admin/token.sh)`
2. Appel : `curl -H "Authorization: Bearer $TOKEN" localhost:8082/admin/stats`

Autre utilisateur : `token.sh client1 client1` (à créer d'abord dans Keycloak, voir `infra/keycloak/README.md`).

## Contrôles de sécurité attendus

| Appel | Résultat attendu |
|---|---|
| `GET :8081/products` sans jeton | 200 |
| `POST :8081/products` sans jeton | 401 |
| `GET :8082/admin/stats` avec jeton admin | 200 |
| Même appel avec un utilisateur sans rôle `admin` | 403 |
| Faux jeton | 401 |
| Transition de statut interdite (`CREATED` → `SHIPPED`) | 409 |

## Pièges

- Si `token.sh` échoue juste après un démarrage, Keycloak n'est pas encore prêt : attendre 20 à 30 s.
- Ne jamais utiliser ce client ni ces mots de passe hors développement.
- Supprimer les comptes de test créés après usage.
