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

### Phase 3 - Video processing avec Twelve Labs

- [x] Integration Twelve Labs SDK pour analyse video
- [x] Upload automatique des videos Instagram vers Twelve Labs
- [x] Extraction des timestamps (debut et fin) pour chaque etape
- [x] Synchronisation des timestamps avec les etapes extraites par Claude
- [ ] Generation clips video individuels a partir des timestamps
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

**Current implementation (MVP):**
- ✅ Using Claude Sonnet 4 via AI SDK
- ✅ Extracts ingredients, steps, times from video descriptions
- ✅ All extraction in English for MVP (cost optimization + international reach)

**Future improvements to consider:**
- [ ] Detect source language and extract in original language (preserves culinary terms authenticity)
- [ ] Multi-language support with client-side translation
- [ ] Video frame analysis for visual ingredient detection

### Decoupage video

Voir la documentation detaillee : [Architecture video](/docs/video/architecture)

### Extraction contenu social media

- [ ] Comment recuperer video Instagram/TikTok ? (API officielle, scraping, service tiers)
- [ ] Gestion des restrictions / rate limits
- [ ] Droits d'auteur et attribution

## Integration Twelve Labs - Video Analysis

### Ce qui est implemente

Swipeat utilise Twelve Labs pour analyser les videos de recettes et extraire automatiquement les timestamps de chaque etape de cuisine.

**Fichiers cles** :
- `src/lib/twelve-labs/client.ts` - Configuration du client Twelve Labs
- `src/lib/twelve-labs/upload-video.ts` - Upload et indexation des videos
- `src/lib/twelve-labs/analyze-video.ts` - Analyse et extraction des timestamps
- `src/server/api/routers/recipe.ts` - Router tRPC qui orchestre l'extraction

**Flux d'extraction** :
1. L'utilisateur colle une URL Instagram
2. L'API Instagram recupere la video et la description
3. Claude Sonnet 4 extrait les ingredients et etapes de la description
4. La video est uploadee sur Twelve Labs et indexee
5. Twelve Labs analyse la video et identifie les timestamps de chaque etape
6. Les timestamps sont fusionnes avec les etapes extraites par Claude
7. Tout est sauvegarde en base de donnees

**Variables d'environnement requises** :
```env
TWELVE_LABS_API_KEY=your_api_key
TWELVE_LABS_INDEX_ID=your_index_id
```

### Prochaines etapes

**Important** : La feature de timestamping video est fonctionnelle mais necessite encore du travail :

1. **Optimisation des couts** :
   - Actuellement, chaque video est uploadee et analysee meme si la recette existe deja
   - Ajouter un systeme de cache des videoId par sourceUrl pour eviter les re-uploads
   - Considerer un TTL pour les videos dans l'index Twelve Labs

2. **Amelioration de la precision** :
   - Tester differents prompts pour l'analyse video
   - Ajouter des exemples (few-shot learning) dans le prompt
   - Valider la coherence des timestamps retournes

3. **Generation des clips video** :
   - Utiliser les timestamps pour decouper la video en clips individuels
   - Stocker les clips (Cloudflare R2, S3, ou Vercel Blob)
   - Mettre a jour le schema DB avec les URLs des clips

4. **Gestion des erreurs** :
   - Actuellement, si Twelve Labs echoue, on continue sans timestamps
   - Ajouter un systeme de retry avec backoff exponentiel
   - Logger les erreurs pour monitoring

5. **Interface utilisateur** :
   - Afficher un indicateur de progression pendant l'upload/analyse (peut prendre 30-60s)
   - Montrer un apercu des timestamps extraits avant sauvegarde
   - Permettre l'edition manuelle des timestamps si necessaire

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
- `TWELVE_LABS_API_KEY` → Cle API Twelve Labs
- `TWELVE_LABS_INDEX_ID` → ID de l'index Twelve Labs (creer un index dans le dashboard)

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
