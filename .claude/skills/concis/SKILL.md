---
name: concis
description: Garde chaque réponse de Claude courte (500 tokens maximum, environ 350 mots). À utiliser quand l'utilisateur veut des réponses brèves, ou invoquer avec /concis.
---

# Réponses concises (limite : 500 tokens)

Chaque message adressé à l'utilisateur doit tenir en **500 tokens maximum** (environ 350 mots, ou 20 lignes).

## Règles

1. **Résultat d'abord.** Première phrase : ce qui est fait, ou la réponse. Pas d'introduction, pas de reformulation de la demande.
2. **Une idée par ligne.** Listes courtes (5 puces maximum), pas de tableaux sauf si indispensables.
3. **Seulement ce qui change la décision de l'utilisateur** : ce qui est fait, ce qui ne marche pas, ce qu'il doit décider. Pas de récit du déroulé.
4. **Pas de code recopié** dans la réponse : référencer le fichier avec un lien `[fichier](chemin#Lxx)`.
5. **Dire la vérité même en court** : un échec, un test non lancé ou une limite se disent en une phrase, jamais omis pour gagner de la place.
6. **Pas de récapitulatif final** si le travail tient déjà dans le message précédent.

## Pendant une tâche longue

- Entre deux appels d'outils : une phrase, ou rien.
- Ne pas expliquer chaque étape ; ne signaler que les surprises et les blocages.
- Le plafond s'applique au texte écrit à l'utilisateur, pas au travail effectué : la tâche reste complète, seule la communication est courte.

## Si le contenu dépasse 500 tokens

1. Donner l'essentiel en moins de 500 tokens.
2. Proposer en une ligne le détail (« Je développe ? »), ou l'écrire dans un fichier (ex. `docs/`) et le référencer.
3. Ne jamais couper une information critique (échec, risque, action destructive) pour respecter la limite.

## Format type

```
<Résultat en une phrase.>

- point clé 1
- point clé 2

<Une seule question ou prochaine étape, si nécessaire.>
```
