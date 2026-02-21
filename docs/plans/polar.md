# Plan : Finalisation intégration Polar + Feature Gating

## Contexte

Swipeat utilise un modèle freemium : la base de recettes open source est gratuite (acquisition), le cookbook personnel est payant (2,99€/mois). Polar est déjà partiellement intégré via `@polar-sh/better-auth`, mais plusieurs éléments manquent :
- Le portail client utilise un UUID hardcodé
- Les webhooks ne font rien (juste un console.log)
- Il n'y a aucun gate sur les features — tous les users authentifiés ont accès à tout
- La table `user` n'a pas de champs subscription

**Stratégie de gating :**
- **Sans compte** : browse + détail complet des recettes open source
- **Compte free** (gratuit, email/password) : créer un compte, mais toutes les actions personnelles sont bloquées — sert de point d'entrée avant souscription
- **Compte payant** (2,99€/mois) : tout débloqué (favoris, collections, extraction, historique, notes, tags)

L'inscription est gratuite et sans friction. Le mur de paiement apparaît uniquement quand l'utilisateur tente une action personnelle.

---

## Philosophie produit

La base de recettes open source est un **outil d'acquisition**. Le produit payant, c'est le **cookbook personnel**.

```
Recettes open source (gratuites)
        ↓
    Nouveaux users (browse anonyme)
        ↓
    Inscription gratuite (friction minimale)
        ↓
    Frustration ("je peux pas save")
        ↓
    Conversion payant
        ↓
    Nouvelles extractions → alimentent l'open source
        ↓
    Plus de contenu gratuit → plus d'acquisition
```

---

## Comparatif des tiers

| Feature                        | Anonyme | Free (compte) | Payant (2,99€/mois) |
|-------------------------------|:-------:|:-------------:|:-------------------:|
| Browse recettes open source   |    ✓    |       ✓       |          ✓          |
| Voir le détail d'une recette  |    ✓    |       ✓       |          ✓          |
| Recherche et filtres          |    ✓    |       ✓       |          ✓          |
| Créer un compte               |    ✗    |       ✓       |          ✓          |
| Sauvegarder en favoris        |    ✗    |       ✗       |          ✓          |
| Collections perso             |    ✗    |       ✗       |          ✓          |
| Notes sur les recettes        |    ✗    |       ✗       |          ✓          |
| Extraire une nouvelle recette |    ✗    |       ✗       |          ✓          |
| Historique                    |    ✗    |       ✗       |          ✓          |
| Tags personnalisés            |    ✗    |       ✗       |          ✓          |

---

## État actuel du code

| Fichier | État |
|---|---|
| `src/server/better-auth/config.ts` | ✅ Polar SDK + checkout + portal configurés |
| `src/app/(polar)/checkout/route.ts` | ✅ Checkout fonctionnel |
| `src/app/(polar)/portal/route.ts` | ❌ UUID client hardcodé |
| `src/app/api/webhooks/polar/route.ts` | ❌ Reçoit les events mais ne fait rien |
| `src/server/db/schema/auth.ts` | ❌ Pas de champs polarCustomerId / subscriptionStatus |
| `src/server/api/trpc.ts` | ❌ Pas de subscribedProcedure |
| `src/server/api/routers/explore.ts` | ❌ list() est protectedProcedure (doit être public) |
| `src/server/api/routers/recipe.ts` | ❌ Pas de gating par tier |
| `src/server/api/routers/saved-recipes.ts` | ❌ Pas de gating par tier |

---

## Décisions d'architecture

### `subscriptionStatus` : raw string, test strict `=== "active"`

Stocker le statut brut renvoyé par Polar (string). Seul `"active"` donne accès. Tous les autres états Polar (`"incomplete"`, `"trialing"`, `"past_due"`, `"unpaid"`, `"canceled"`, `"revoked"`) sont traités comme non-abonné. Simple et exhaustif — un état Polar inconnu ne donne jamais accès par erreur.

### `@polar-sh/better-auth` v1.6.0 n'expose pas `subscriptionStatus` dans la session

Confirmé par inspection du package. Le plugin gère uniquement les hooks de lifecycle user (création/maj/suppression du customer Polar). Le `subscriptionStatus` doit être lu depuis la DB à chaque `subscribedProcedure`. Pas de workaround possible côté session.

Pour le `useSubscription()` hook côté client, utiliser l'endpoint `/customer/state` exposé par le plugin plutôt qu'une query tRPC dédiée.

### Race condition checkout → webhook

Le webhook `subscription.active` peut arriver avec un léger délai après que l'user revient du checkout. Pendant ce délai, son accès est encore refusé alors qu'il vient de payer. Traitement en v1 : afficher un message "Activation en cours, rechargez dans quelques secondes." Pas de polling ni de retry automatique.

---

## Étapes d'implémentation

### Étape 1 — Schema DB : ajouter les champs Polar au user

**Fichier :** `src/server/db/schema/auth.ts`

Ajouter deux champs à la table `user` :
```typescript
polarCustomerId: text("polar_customer_id"),
subscriptionStatus: text("subscription_status"), // raw Polar status, seul "active" donne accès
```

Puis générer et appliquer la migration Drizzle :
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

### Étape 2 — Fixer le portail client (hardcoded UUID)

**Fichier :** `src/app/(polar)/portal/route.ts`

Remplacer le UUID hardcodé par une lecture du `polarCustomerId` depuis la session :

```typescript
export const GET = CustomerPortal({
  accessToken: env.POLAR_ACCESS_TOKEN,
  getCustomerId: async (req) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) throw new Error("Unauthorized");
    const [dbUser] = await db.select({ polarCustomerId: user.polarCustomerId })
      .from(user)
      .where(eq(user.id, session.user.id));
    if (!dbUser?.polarCustomerId) throw new Error("No Polar customer");
    return dbUser.polarCustomerId;
  },
  returnUrl: env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  server: env.POLAR_SERVER,
});
```

---

### Étape 3 — Webhooks : stocker l'état d'abonnement

**Fichiers :** `src/app/api/webhooks/polar/route.ts`, `src/app/api/webhooks/polar/handlers.ts`

Le webhook handler sépare la logique métier (handlers.ts) de l'entry point (route.ts) pour la testabilité.

**route.ts** — entry point avec vérification HMAC automatique via `@polar-sh/nextjs` :
```typescript
export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    await handlePolarPayload(payload, db);
  },
});
```

**handlers.ts** — logique métier :
```typescript
async function updateSubscriptionStatus(db, status, customerId, customer) {
  const externalId = customer?.externalId;
  if (externalId) {
    // Prioritise externalId (Better Auth user.id) — also stores polarCustomerId if missing
    await db.update(user)
      .set({ subscriptionStatus: status, polarCustomerId: customerId })
      .where(eq(user.id, externalId));
  } else {
    await db.update(user)
      .set({ subscriptionStatus: status })
      .where(eq(user.polarCustomerId, customerId));
  }
}

export async function handlePolarPayload(payload, db) {
  switch (payload.type) {
    case "customer.created":
      await db.update(user)
        .set({ polarCustomerId: payload.data.id })
        .where(eq(user.id, payload.data.externalId));
      break;
    case "subscription.active":
      await updateSubscriptionStatus(db, "active", payload.data.customerId, payload.data.customer);
      break;
    case "subscription.canceled":
      await updateSubscriptionStatus(db, "canceled", payload.data.customerId, payload.data.customer);
      break;
    case "subscription.revoked":
      await updateSubscriptionStatus(db, "revoked", payload.data.customerId, payload.data.customer);
      break;
  }
}
```

#### Piège critique : `customer.created` avec `externalId: null`

**Problème rencontré en production sandbox** : quand un user existant souscrit depuis la page settings (plutôt qu'à l'inscription), Polar envoie `customer.created` avec `external_id: null`. Raison : `@polar-sh/better-auth` crée d'abord le customer sans `externalId` (`onBeforeUserCreate`), puis le met à jour avec `externalId` dans `onAfterUserCreate`. Le webhook `customer.created` arrive entre les deux.

**Conséquence** : `polarCustomerId` n'est jamais stocké en DB → les webhooks `subscription.active/canceled/revoked` ne trouvent pas le user → aucune mise à jour du statut.

**Solution** : dans les webhooks `subscription.*`, utiliser `payload.data.customer.externalId` (Better Auth user.id) comme lookup primaire, et stocker `polarCustomerId` en même temps. Le payload `subscription.active` contient toujours l'objet `customer` complet avec `externalId` rempli, car Better Auth a eu le temps de faire son `customers.update()` avant que l'abonnement soit activé.

#### Product ID : variable d'environnement

Le product ID Polar est réutilisé à plusieurs endroits (config Better Auth, redirects UI). Le stocker dans `NEXT_PUBLIC_POLAR_PRODUCT_ID` (prefixe `NEXT_PUBLIC_` pour qu'il soit accessible côté client sans import de `env`).

Dans `env.js` :
```js
client: {
  NEXT_PUBLIC_POLAR_PRODUCT_ID: z.string().min(1),
}
```

Dans les composants client, utiliser directement `process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID` (pas besoin d'importer `env` côté client). Dans la config server-side Better Auth, utiliser `env.NEXT_PUBLIC_POLAR_PRODUCT_ID`.

#### Développement local : ngrok obligatoire

Polar ne peut pas joindre `localhost` pour envoyer les webhooks. En développement :
1. Lancer ngrok : `ngrok http 3000`
2. Configurer l'URL webhook dans le dashboard Polar sandbox : `https://<tunnel>.ngrok-free.app/api/webhooks/polar`
3. Vérifier que le `POLAR_WEBHOOK_SECRET` dans `.env` correspond au secret affiché dans le dashboard Polar

Sans ngrok actif, tous les webhooks arrivent en 404 et la DB n'est jamais mise à jour.

---

### Étape 4 — tRPC : ajouter `subscribedProcedure`

**Fichier :** `src/server/api/trpc.ts`

La session Better Auth n'expose pas `subscriptionStatus` — la query DB est nécessaire à chaque appel.

```typescript
export const subscribedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const [dbUser] = await ctx.db
      .select({ subscriptionStatus: user.subscriptionStatus })
      .from(user)
      .where(eq(user.id, ctx.session.user.id));
    if (dbUser?.subscriptionStatus !== "active") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Subscription required" });
    }
    return next({
      ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
  });
```

---

### Étape 5 — Appliquer le gating aux routers

| Router | Procédure | Changement |
|---|---|---|
| `explore.list()` | `protectedProcedure` | → `publicProcedure` |
| `recipe.getById()` | `protectedProcedure` | → `publicProcedure` |
| `recipe.getBySourceUrl()` | `protectedProcedure` | → `subscribedProcedure` |
| `recipe.extractAndSave()` | `protectedProcedure` | → `subscribedProcedure` |
| `recipe.save()` | `protectedProcedure` | → `subscribedProcedure` |
| `savedRecipes.*` (tous) | `protectedProcedure` | → `subscribedProcedure` |

---

### Étape 6 — UI : adapter les CTAs

Les boutons déclenchant des actions payantes doivent rediriger vers `/checkout/swipeat` si non abonné :

- Bouton "Sauvegarder" (favoris)
- Bouton "Extraire une recette"
- Accès collections

Créer un hook `useSubscription()` côté client qui appelle l'endpoint `/customer/state` exposé par `@polar-sh/better-auth` (pas de query tRPC dédiée nécessaire).

**Race condition checkout** : si l'user revient du checkout et que le webhook n'est pas encore arrivé, afficher "Activation en cours, rechargez dans quelques secondes." Pas de polling automatique en v1.

---

## Ordre de priorité

1. **Étapes 1–3** : fondations — bloquant pour la cohérence des données
2. **Étape 4** : `subscribedProcedure` — bloquant pour le gating
3. **Étape 5** : appliquer le gating aux routers
4. **Étape 6** : UI (peut se faire en parallèle avec 4–5)

---

## TDD

Pour chaque étape, écrire les tests avant le code :

- **Webhook handlers** : `customer.created` → `polarCustomerId` rempli ; `subscription.active` → statut mis à jour ; `subscription.canceled` → accès révoqué
- **`subscribedProcedure`** : user sans abonnement → `FORBIDDEN` ; user abonné → passe
- **Routers** : `explore.list` accessible sans session ; `savedRecipes.toggle` → `FORBIDDEN` sans abonnement

**Test des webhooks** : les webhooks Polar vérifient une signature HMAC. Créer un helper de test qui signe les payloads avec le `POLAR_WEBHOOK_SECRET` de test pour générer des requêtes valides — sans ça, les tests webhook seront rejetés avant même d'atteindre le handler.

---

## Vérification end-to-end (sandbox)

1. Démarrer l'app avec `POLAR_SERVER=sandbox`
2. Créer un compte → inspecter le payload `customer.created` reçu (logs) pour confirmer `externalId` = notre `user.id`
3. Vérifier `polarCustomerId` rempli en DB
4. Aller sur `/checkout/swipeat` → compléter le paiement test
5. Vérifier `subscriptionStatus = "active"` en DB (webhook `subscription.active`)
6. Tester qu'on peut extraire une recette
7. Annuler l'abonnement depuis `/portal` → vérifier `subscriptionStatus = "canceled"` ou `"revoked"`
8. Vérifier que l'extraction est bloquée (`FORBIDDEN`)

---

## Pré-launch

Seeder la base avec 50–100 recettes virales (TikTok, Instagram) pour que le free tier ait de la valeur dès le jour 1.
