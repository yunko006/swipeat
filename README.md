# Swipeat

**AI-powered recipe extraction from social media** - Transformez vos videos Instagram et TikTok en recettes interactives.

Collez un lien, notre IA extrait la recette, estime les quantites et decoupe la video en etapes claires. Cuisinez en swipant comme sur les stories.

## Concept

Swipeat permet de transformer n'importe quelle video de recette Instagram ou TikTok en une experience de cuisine interactive :

1. **Extraction automatique** - Collez un lien Instagram Reels/TikTok
2. **Analyse IA** - Detection des ingredients, estimation des quantites, identification des etapes
3. **Video decoupee** - Chaque etape synchronisee avec le moment exact de la video
4. **Navigation swipeable** - Interface style Instagram Stories pour suivre la recette

### Modele freemium

- **Utilisateurs gratuits** : Peuvent parcourir toutes les recettes publiques extraites par la communaute, avec un player video limite
- **Utilisateurs premium** : Peuvent extraire leurs propres recettes, sauvegarder leurs favoris, voir l'historique et acceder au player video complet

### Mutualisation des recettes

Quand un utilisateur extrait une recette depuis une URL :

- L'app verifie si cette URL existe deja dans la base de donnees
- Si oui → La recette existante est attribuee directement (pas de rappel API)
- Si non → Extraction complete + sauvegarde dans la base publique

Toutes les recettes extraites sont ajoutees a la bibliothèque publique open-source accessible a tous.

## Architecture Next.js

```
src/app/
├── layout.tsx                    # Layout global de base
├── page.tsx                      # Landing page avec hero et CTA
│
├── (auth)/                       # Group route - Pages d'authentification
│   ├── login/page.tsx           # Connexion
│   └── signup/page.tsx          # Inscription
│
├── explore/page.tsx              # Browse recettes publiques (TOUS)
├── recette/
│   ├── page.tsx                 # Ancienne route (query params)
│   └── [id]/page.tsx            # Detail recette dynamique (TOUS)
│
├── mes-recettes/page.tsx        # Historique personnel (PREMIUM)
├── extraire/page.tsx             # Extraction depuis URL (PREMIUM - a creer)
├── favoris/page.tsx              # Recettes favorites (PREMIUM - a creer)
│
├── (polar)/                      # Group route - Routes Polar
│   ├── checkout/route.ts
│   └── portal/route.ts
│
├── (docs)/                       # Group route - Documentation Fumadocs
│   ├── layout.tsx
│   └── docs/[[...slug]]/page.tsx
│
└── api/
    ├── auth/[...all]/route.ts   # Better Auth API
    ├── trpc/[trpc]/route.ts     # tRPC API
    ├── webhooks/polar/route.ts  # Webhooks Polar
    └── (a venir)
        ├── extract/route.ts     # Extraction recette depuis URL
        └── recipes/
            ├── [id]/route.ts    # CRUD recette
            └── check-url/route.ts # Verifier si URL existe

```

### Philosophie de routing

**Pas de separation complexe avec group routes** pour les pages publiques vs premium.

- Les **group routes** sont utilisés uniquement pour partager un layout specifique : `(auth)`, `(polar)`, `(docs)`
- Les pages premium (`mes-recettes`, `extraire`, `favoris`) sont au meme niveau que les pages publiques
- La **protection premium** se fait au niveau composant (pas au niveau layout)
- L'**UI conditionnelle** affiche differents niveaux de features selon le statut user

## Flux utilisateur

### Utilisateur NON CONNECTE

1. Arrive sur `/` (landing)
2. Peut parcourir `/explore`
3. Peut voir `/recette/[id]` avec player limite
4. Banniere CTA pour s'inscrire

### Utilisateur GRATUIT (connecte)

1. Meme chose que non-connecte
2. Peut voir son historique de navigation
3. Peut "liker" des recettes
4. Clique sur "Extraire" ou "Mes recettes" → Page "Premium Required"

### Utilisateur PREMIUM

1. Accès complet partout
2. Peut extraire depuis `/extraire` (a creer)
3. Historique dans `/mes-recettes` (a creer)
4. Player video complet sur toutes les recettes
5. Peut sauvegarder des recettes publiques dans ses favoris

## Fonctionnalites a implementer

### Phase 1 - MVP (En cours)

- [x] Landing page avec hero
- [x] Page `/explore` avec grille de recettes
- [x] Page `/recette/[id]` avec bento
- [x] Composants bento (ingredients, etapes, video)
- [x] Player swipeable Instagram-like (BentoLetmecook)
- [ ] Integration Better Auth complete
- [ ] Integration Polar pour premium

### Phase 2 - Extraction IA

- [ ] Page `/extraire` pour utilisateurs premium
- [ ] API `/api/extract` - Extraction depuis URL Instagram/TikTok
- [ ] Integration AI SDK pour detection ingredients
- [ ] Estimation automatique des quantites
- [ ] Sauvegarde en base de donnees

### Phase 3 - Video processing : GPT-4 Vision + Whisper ou Twelve Labs

- [ ] Solution de decoupage video par etape
- [ ] Synchronisation timestamps avec etapes
- [ ] Generation clips video individuels
- [ ] Stockage videos (S3, Cloudflare, etc.)

### Phase 4 - Features premium

- [ ] Page `/mes-recettes` - Historique personnel
- [ ] Page `/favoris` - Recettes sauvegardees
- [ ] Systeme de likes
- [ ] Verification URL existante avant extraction
- [ ] Attribution recette existante

## Structure des donnees

### Recette (actuel - mock data)

```typescript
interface Recipe {
  id: number;
  title: string;
  date: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  marginNote: string;
  ingredients: string[];
  instructions: string[];
  bottomNote: string;
  category?: string;
  thumbnail?: string;
  author?: string;
  likes?: number;
}
```

### Schema DB (a implementer)

```sql
-- Table recettes (opensource, accessible a tous)
recipes
  - id
  - source_url (unique)
  - title
  - description
  - prep_time
  - cook_time
  - servings
  - category
  - thumbnail_url
  - video_url
  - created_at
  - created_by (user_id)
  - likes_count

-- Ingredients (relation many-to-many)
ingredients
  - id
  - recipe_id
  - name
  - quantity
  - unit
  - order

-- Etapes avec timestamps video
steps
  - id
  - recipe_id
  - order
  - description
  - video_start_time
  - video_end_time
  - video_clip_url (optionnel si clips pre-decoupes)

-- Relations utilisateur-recettes (premium)
user_recipes
  - user_id
  - recipe_id
  - is_favorite
  - is_creator
  - created_at

-- Users (Better Auth)
users
  - id
  - email
  - is_premium
  - premium_expires_at
```

## Questions ouvertes & Decisions a prendre

### IA pour extraction ingredients

- [ ] Quel provider ? (OpenAI GPT-4 Vision, Claude Vision, Gemini)
- [ ] Comment parser la description Instagram/TikTok ?
- [ ] Estimation quantites : modele specifique ou prompt engineering ?

### Decoupage video

- [ ] Solution ? (FFmpeg, service tiers, API specialisee)
- [ ] Stocker clips decoupes ou timestamps uniquement ?
- [ ] Hebergement videos ? (S3, Cloudflare R2, Vercel Blob)

### Extraction contenu social media

- [ ] Comment recuperer video Instagram/TikTok ? (API officielle, scraping, service tiers)
- [ ] Gestion des restrictions / rate limits
- [ ] Droits d'auteur et attribution

## Deployment

### Vercel (recommande)

1. Push sur GitHub
2. Importer sur Vercel
3. Ajouter variables d'environnement
4. Deploy

**Variables production** :

- `BETTER_AUTH_URL` → Votre domaine
- `POLAR_SERVER` → `"production"`
- `POLAR_SUCCESS_URL` → URL production

## Resources

### Stack & Tools

- [Next.js Docs](https://nextjs.org/docs)
- [Better Auth](https://www.better-auth.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [tRPC](https://trpc.io/docs)
- [Polar Payments](https://docs.polar.sh/)
- [shadcn/ui](https://ui.shadcn.com)

## License

MIT
