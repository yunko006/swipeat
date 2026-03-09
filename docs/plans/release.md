# Plan de Release Production — Swipeat MVP

## Context

Swipeat est prêt fonctionnellement mais plusieurs points bloquent une release prod fiable :
la page new-recipe est un mock, la sécurité du cron est faible, Polar est encore en sandbox,
et il manque des protections de base. Ce plan cible un **MVP viable** : on corrige les bugs
critiques et la sécurité, on rend la page new-recipe fonctionnelle, sans refacto majeur.

---

## 1. CRITIQUE — Page new-recipe fonctionnelle

**Problème** : La page `src/app/new-recipe/page.tsx` simule l'extraction avec des `setTimeout`
et redirige en dur vers `?id=1`. Aucun appel API réel n'est fait.

**Actions** :
- Appeler le tRPC `extractAndSave` avec l'URL saisie par l'utilisateur
- Remplacer la progression simulée par un état réel (loading/success/error)
- Rediriger vers `/recette?id={recipeId}` avec l'ID retourné par l'API
- Gérer les erreurs (URL invalide, échec API, timeout)

**Fichiers** :
- `src/app/new-recipe/page.tsx` (refaire la logique d'extraction)

---

## 2. CRITIQUE — Sécurité du cron

**Problème** : `CRON_SECRET` est optionnel dans `env.js`. Si non défini, le endpoint cron
est accessible sans auth.

**Actions** :
- Rendre `CRON_SECRET` requis en production dans `src/env.js`
- Garder optionnel en dev/test

**Fichiers** :
- `src/env.js` (ligne 26)

---

## 3. CRITIQUE — Polar : passage sandbox → production

**Problème** : `POLAR_SERVER` est en `sandbox`. Pas encore de compte prod.

**Actions** :
- Documenter les étapes pour créer le compte Polar production
- S'assurer que `POLAR_SERVER` est bien `production` dans les env vars Vercel
- Vérifier que le webhook secret et l'access token sont ceux de prod
- Tester le flow subscription end-to-end en sandbox avant de switcher

**Fichiers** :
- `src/env.js` (déjà supporté via le default "sandbox")
- Variables d'environnement Vercel (config manuelle)

---

## 4. IMPORTANT — Gestion des erreurs dans extractAndSave

**Problème** : L'échec de l'analyse vidéo Twelve Labs est silencieusement avalé (console.log
seulement). L'utilisateur ne sait pas que les timestamps n'ont pas été extraits.

**Actions** :
- Retourner un flag `videoAnalysisFailed: true` dans la réponse au lieu de silencer l'erreur
- Afficher un message côté client si les timestamps n'ont pas pu être extraits

**Fichiers** :
- `src/server/api/routers/recipe.ts` (lignes 130-133)

---

## 5. IMPORTANT — Webhook Polar : events manquants

**Problème** : Seuls 4 events Polar sont gérés. `subscription.expired`, `subscription.renewed`,
etc. sont silencieusement ignorés.

**Actions** :
- Ajouter un `default` case qui log les events non gérés
- Évaluer si `subscription.expired` doit être traité (probablement oui → mettre status "expired")

**Fichiers** :
- `src/app/api/webhooks/polar/handlers.ts`

---

## 6. IMPORTANT — Security headers

**Problème** : Aucun header de sécurité configuré dans Next.js.

**Actions** :
- Ajouter dans `next.config.mjs` les headers :
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security` (HSTS)

**Fichiers** :
- `next.config.mjs`

---

## 7. MINEUR — getUserImportedRecipes sans pagination

**Problème** : Retourne toutes les recettes d'un user sans limite.

**Actions** :
- Ajouter un `.limit(50)` par défaut (suffisant pour MVP, pagination plus tard)

**Fichiers** :
- `src/server/api/routers/recipe.ts` (ligne 172)

---

## 8. MINEUR — Metadata et SEO de base

**Problème** : Le titre est "swipeat" et la description "let me cook bro" — pas sérieux pour
une release.

**Actions** :
- Mettre un titre et une description appropriés dans `layout.tsx`
- Vérifier le favicon

**Fichiers** :
- `src/app/layout.tsx`

---

## Hors scope (post-MVP)

Ces items ont été identifiés mais ne sont pas nécessaires pour le MVP :
- Rate limiting sur les API routes
- Error boundaries React
- Logging structuré (Pino/Winston)
- Error tracking (Sentry)
- Health check endpoint
- Retry logic sur les appels externes
- Timeouts explicites sur Twelve Labs
- Connection pooling DB
- Types Polar (remplacer les `any`)

---

## Vérification

1. **new-recipe** : Coller une URL Instagram → vérifier que l'extraction se lance réellement,
   que la progression reflète l'état réel, et que la redirection utilise le bon ID
2. **Cron** : Vérifier que le build échoue si `CRON_SECRET` n'est pas défini en prod
3. **Polar** : Tester le webhook avec un event non géré → vérifier le log
4. **Headers** : Vérifier avec `curl -I` que les headers de sécurité sont présents
5. **Recettes** : Vérifier que `getUserImportedRecipes` retourne max 50 résultats
6. **Build** : `npm run build` passe sans erreur
