# Keycloak (comptes et authentification)

Le realm `minimarket` est importé au **premier** démarrage de Keycloak (`minimarket-realm.json`). Pour réimporter après une modification du fichier : `docker compose up -d --force-recreate keycloak` (les comptes créés sont alors perdus, la base est dans le conteneur).

## Types d'utilisateurs

| Rôle | Qui | Accès |
|---|---|---|
| `customer` | Tout compte créé via `/register` | Boutique, commandes liées au compte (`/account`, `/account/orders`) |
| `admin` | Compte seed `admin@minimarket.local` (aussi `customer`) | Tout, plus l'espace `/admin` et les routes `/admin/**` de l'API |

Une commande sans compte reste possible (invité) : elle n'est liée à aucun compte.

## Comptes et clients

| Élément | Valeur |
|---|---|
| Console Keycloak | http://localhost:8180 (admin / admin, realm `master`) |
| Admin boutique | `admin@minimarket.local` / `admin1234` |
| `minimarket-front` | client public ; **connexion directe (password grant)** depuis le front, CORS limité à `http://localhost:4200` |
| `minimarket-user-service` | client confidentiel avec compte de service (`manage-users`) ; sert à créer les comptes. Secret DEV `dev-user-service-secret` |
| `minimarket-dev-cli` | **DEV uniquement**, pour tester l'API avec `curl` |

## Flux

- **Inscription** : front → `user-service` (`POST /accounts/register`) → API admin de Keycloak (création + rôle `customer`) → connexion automatique.
- **Connexion** : front → Keycloak (`/token`) avec e-mail et mot de passe ; jetons gardés dans `sessionStorage` (perdus à la fermeture de l'onglet), rafraîchis automatiquement.
- **API** : les services vérifient la signature des jetons (JWKS du realm) et lisent `realm_access.roles`.

## Limites connues (dev)

- Le password grant est déprécié par OAuth 2.1 : à remplacer par le flux code + PKCE (pages Keycloak) avant une mise en production. Les jetons en `sessionStorage` sont lisibles par du JavaScript injecté (XSS).
- Pas de serveur d'e-mails : e-mail marqué vérifié à la création, pas de « mot de passe oublié ».
- Émetteur (`iss`) et audience des jetons non vérifiés par les services.
- Mots de passe et secrets triviaux, HTTP, `start-dev` : ne pas exposer tel quel.
- Politique de mot de passe : 8 caractères minimum ; protection anti force brute de Keycloak activée.

## Tester en ligne de commande

```bash
TOKEN=$(bash .claude/skills/token-admin/token.sh)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8082/admin/stats
```
