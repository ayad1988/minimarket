---
name: verifier-ui
description: Vérifier le rendu réel du front MiniMarket (boutique et admin) avec Chrome headless, captures d'écran et relevé des erreurs JS ou API. À utiliser après une modification du front ou d'une API pour confirmer que ça marche vraiment.
---

# Vérifier l'interface dans un vrai navigateur

Prérequis : front sur `localhost:4200` (voir skill `relancer-stack`) et Chrome installé.

## Installation (une seule fois)

```bash
cd .claude/skills/verifier-ui && PUPPETEER_SKIP_DOWNLOAD=1 npm install
```

## Utilisation

```bash
# Boutique (captures + erreurs)
node .claude/skills/verifier-ui/check.mjs --out <dossier_temp> / /search /product/<id> /cart

# Admin (connexion automatique via la page /login : admin@minimarket.local / admin1234)
node .claude/skills/verifier-ui/check.mjs --out <dossier_temp> --admin /admin /admin/products /admin/orders
```

Options : `--width 400` pour le mobile, `--base <url>`, variables `MM_USER` et `MM_PASSWORD` (autre compte).

Sortie : une ligne `OK` ou `KO` par page avec le titre, le fichier PNG, puis les erreurs (exception JS, `console.error`, réponse API 4xx ou 5xx). Code de retour 1 si une page est en erreur.

## Après le script

1. **Regarder** au moins une capture (outil Read sur le PNG) : le script ne détecte pas un décalage de mise en page.
2. Pour un parcours avec actions (clics, formulaires), écrire un script ponctuel dans le dossier temporaire, sur le modèle de `check.mjs`.
3. Utiliser un dossier temporaire pour les captures, pas le dépôt.

## Pièges

- `networkidle2` attend la fin des appels réseau : une page qui se rafraîchit en continu peut expirer.
- Page de connexion Angular : champs `#email`, `#password`, bouton `.auth form button[type=submit]`.
- Pour tester un client (sans rôle admin) : s'inscrire via `/register`, il doit atterrir sur `/forbidden` en visitant `/admin`.
- Les erreurs `Vite` de réoptimisation au premier chargement sont du bruit : relancer une fois.
