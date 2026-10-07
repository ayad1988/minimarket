---
name: token-admin
description: Obtenir un jeton Keycloak et appeler les API protégées de MiniMarket avec curl (routes /admin, écriture catalogue). À utiliser pour tester la sécurité ou une route admin en ligne de commande.
---

# Jeton Keycloak pour tester l'API

Prérequis : le compose tourne (Keycloak sur `localhost:8180`). Client de test **DEV uniquement** : `minimarket-dev-cli`.

## Étapes

1. Jeton admin : `TOKEN=$(bash .claude/skills/token-admin/token.sh)`
2. Appel : `curl -H "Authorization: Bearer $TOKEN" localhost:8082/admin/stats`

Autre utilisateur : `token.sh email mot_de_passe`. Un client se crée via `POST localhost:8084/accounts/register` (JSON `email`, `password` 8+ caractères, `firstName`, `lastName`). Un compte d'inscription a le rôle `customer`, donc 403 sur `/admin`.

## Contrôles de sécurité attendus

| Appel | Résultat attendu |
|---|---|
| `GET :8081/products` sans jeton | 200 |
| `POST :8081/products` sans jeton | 401 |
| `GET :8082/admin/stats` avec jeton admin | 200 |
| Même appel avec un compte client (rôle `customer`) | 403 |
| `GET :8082/orders/mine` sans jeton | 401 |
| Faux jeton | 401 |
| Transition de statut interdite (`CREATED` → `SHIPPED`) | 409 |

## Pièges

- Si `token.sh` échoue juste après un démarrage, Keycloak n'est pas encore prêt : attendre 20 à 30 s.
- Ne jamais utiliser ce client ni ces mots de passe hors développement.
- Supprimer les comptes de test créés après usage.
