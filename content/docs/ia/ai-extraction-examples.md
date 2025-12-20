---
title: Exemple de prompt pour extraction de recette
description: test
---

## Input (Description Instagram typique):

```
Pâtes à la carbonara express! 🍝

Ingrédients:
- 400g de spaghetti
- 200g de lardons
- 4 jaunes d'œufs
- 100g de parmesan râpé
- Poivre noir
- Sel

Cuisson 15 min!

1. Faire cuire les pâtes al dente
2. Pendant ce temps, faire revenir les lardons
3. Mélanger jaunes + parmesan + poivre
4. Égoutter les pâtes (garder 1 verre d'eau de cuisson)
5. Mélanger pâtes + lardons hors du feu
6. Ajouter le mélange œufs-parmesan
7. Ajouter un peu d'eau de cuisson si trop sec

Pour 4 personnes 👨‍👩‍👧‍👦
```

## Output attendu (JSON structuré):

```json
{
  "ingredients": [
    {
      "name": "spaghetti",
      "quantity": "400",
      "unit": "g"
    },
    {
      "name": "lardons",
      "quantity": "200",
      "unit": "g"
    },
    {
      "name": "jaunes d'œufs",
      "quantity": "4",
      "unit": ""
    },
    {
      "name": "parmesan râpé",
      "quantity": "100",
      "unit": "g"
    },
    {
      "name": "poivre noir",
      "quantity": "",
      "unit": "",
      "notes": "au goût"
    },
    {
      "name": "sel",
      "quantity": "",
      "unit": "",
      "notes": "pour l'eau de cuisson"
    }
  ],
  "steps": [
    {
      "order": 1,
      "instruction": "Faire cuire les pâtes al dente dans l'eau salée",
      "durationMinutes": 10
    },
    {
      "order": 2,
      "instruction": "Pendant ce temps, faire revenir les lardons à la poêle",
      "durationMinutes": 5
    },
    {
      "order": 3,
      "instruction": "Dans un bol, mélanger les jaunes d'œufs, le parmesan râpé et le poivre noir",
      "durationMinutes": 2
    },
    {
      "order": 4,
      "instruction": "Égoutter les pâtes en gardant 1 verre d'eau de cuisson de côté",
      "durationMinutes": 1
    },
    {
      "order": 5,
      "instruction": "Hors du feu, mélanger les pâtes chaudes avec les lardons",
      "durationMinutes": 1
    },
    {
      "order": 6,
      "instruction": "Ajouter le mélange œufs-parmesan et bien mélanger",
      "durationMinutes": 1
    },
    {
      "order": 7,
      "instruction": "Si la sauce est trop épaisse, ajouter progressivement un peu d'eau de cuisson",
      "durationMinutes": 1
    }
  ],
  "prepTimeMinutes": 5,
  "cookTimeMinutes": 15,
  "servings": 4
}
```

## Notes:

- L'IA a intelligemment:
  - Séparé les ingrédients avec et sans quantités
  - Détaillé les étapes même si elles étaient condensées dans la description
  - Estimé les durées pour chaque étape
  - Extrait le nombre de portions
  - Ajouté des précisions utiles ("dans l'eau salée", "à la poêle")
