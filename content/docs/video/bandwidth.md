---
title: Bandwidth et coûts
description: Qu'est-ce que le bandwidth ?
---

Le **bandwidth** (bande passante) représente la quantité de données transférées entre ton serveur et les utilisateurs.

### Formule simple

```
Bandwidth mensuel = Nombre de visites × Taille moyenne de la page × Pages vues par visite
```

## Estimation pour Swipeat

Les vidéos sont le plus gros consommateur de bandwidth.

### Exemple avec 1000 utilisateurs/mois

```
Vidéos :
- Taille moyenne vidéo Instagram : ~5-15 MB (selon qualité et durée)
- Moyenne : 10 MB
- Utilisateurs regardent 3 recettes : 1000 × 3 = 3000 vidéos chargées
- Bandwidth vidéo : 3000 × 10 MB = 30 GB

Autres assets (HTML, CSS, JS, images) :
- ~2-3 MB par visite
- 1000 utilisateurs × 3 MB = 3 GB

TOTAL : ~33 GB/mois pour 1000 utilisateurs actifs
```

## Plans Vercel

| Plan                | Bandwidth inclus | Prix au-delà     | Prix mensuel |
| ------------------- | ---------------- | ---------------- | ------------ |
| **Hobby (gratuit)** | 100 GB/mois      | Non disponible\* | $0           |
| **Pro**             | 1 TB/mois        | $40/100GB        | $20/mois     |
| **Enterprise**      | Custom           | Custom           | Sur devis    |

\* Si tu dépasses 100 GB sur le plan Hobby, Vercel peut throttle (ralentir) ton site ou te demander de passer au plan Pro.

## Scénarios réalistes pour Swipeat

### Scénario 1 - Early MVP (0-500 users/mois)

- **Bandwidth estimé** : ~15-20 GB/mois
- **Plan recommandé** : Hobby (gratuit) ✅
- Tu restes largement sous les 100 GB

### Scénario 2 - Growth phase (1000-3000 users/mois)

- **Bandwidth estimé** : ~50-150 GB/mois
- **Plan recommandé** : Pro ($20/mois) si dépassement des 100 GB
- Largement couvert par le 1 TB inclus

### Scénario 3 - Traction (10,000+ users/mois)

- **Bandwidth estimé** : ~300-500 GB/mois
- **Plan recommandé** : Pro ($20/mois)
- Toujours dans le 1 TB inclus
- Commence à considérer un CDN externe pour les vidéos

## Comment réduire les coûts de bandwidth ?

### 1. Héberger les vidéos ailleurs (priorité #1)

- ❌ Ne pas servir les vidéos depuis Vercel
- ✅ Utiliser Cloudflare R2 (gratuit jusqu'à 10 GB stockage, **bandwidth gratuit** vers internet)
- ✅ Ou garder les liens directs Instagram (pas de coûts pour toi)

### 2. Compression vidéo

- Re-encoder les vidéos en qualité mobile optimisée
- Utiliser des formats modernes (VP9, AV1) si supportés

### 3. CDN externe

- **Cloudflare** (gratuit) devant Vercel
- **BunnyCDN** ($0.01/GB, très peu cher)
- **Cloudflare R2** - Bandwidth de sortie GRATUIT

### 4. Lazy loading intelligent

- Ne charger la vidéo que quand l'utilisateur clique sur "Let me cook"
- Précharger uniquement le premier chunk (première étape)

## Recommandation pour Swipeat

### Pour le MVP : Plan Hobby gratuit

- Les vidéos sont servies directement depuis Instagram (pas de bandwidth Vercel)
- Tu paies uniquement pour le HTML/CSS/JS de ton app
- Tu peux facilement supporter **2000-3000 utilisateurs/mois gratuitement**

### Si tu héberges les vidéos : Cloudflare R2

Passe immédiatement à **Cloudflare R2** :

- ✅ Stockage : Gratuit jusqu'à 10 GB
- ✅ Bandwidth de sortie vers internet : **GRATUIT** (illimité)
- ✅ Pas de facture surprise même avec 100,000 utilisateurs

## Outils de monitoring

### 1. Dashboard Vercel

1. Aller sur Dashboard Vercel → Analytics → Bandwidth
2. Activer les alertes à 80% de quota
3. Surveiller les pics inhabituels (bots, scraping)

### 2. Script de monitoring personnalisé

Crée un fichier `scripts/check-bandwidth.ts` :

```typescript
import { createClient } from "@vercel/edge-config";

async function checkBandwidth() {
  const response = await fetch(
    `https://api.vercel.com/v1/teams/${process.env.VERCEL_TEAM_ID}/bandwidth`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  console.log(
    "Bandwidth utilisé ce mois:",
    data.total / 1024 / 1024 / 1024,
    "GB"
  );
  console.log("Limite:", data.limit / 1024 / 1024 / 1024, "GB");
  console.log(
    "Pourcentage:",
    ((data.total / data.limit) * 100).toFixed(2),
    "%"
  );

  if (data.total / data.limit > 0.8) {
    console.warn("⚠️ ATTENTION : 80% du bandwidth utilisé !");
  }
}

checkBandwidth();
```

Exécute-le avec :

```bash
tsx scripts/check-bandwidth.ts
```

### 3. Monitoring avec Analytics

Ajoute un tracker pour mesurer le bandwidth réel côté client :

```typescript
// src/lib/analytics/bandwidth-tracker.ts

export function trackVideoLoad(videoUrl: string, videoSize: number) {
  // Log dans ta base de données ou service analytics
  fetch("/api/analytics/bandwidth", {
    method: "POST",
    body: JSON.stringify({
      url: videoUrl,
      size: videoSize,
      timestamp: Date.now(),
    }),
  });
}

// Dans ton composant vidéo
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  video.addEventListener("loadedmetadata", () => {
    // Estimer la taille basée sur la durée et le bitrate
    const estimatedSize = video.duration * 1.5; // ~1.5 MB/s pour vidéo Instagram
    trackVideoLoad(videoUrl, estimatedSize);
  });
}, [videoUrl]);
```

### 4. Google Analytics 4 - Événements personnalisés

```typescript
// Dans ton composant BentoLetmecook
import { event } from "nextjs-google-analytics";

useEffect(() => {
  if (isOpen) {
    event("video_opened", {
      category: "engagement",
      label: recipe.title,
      video_url: videoUrl,
    });
  }
}, [isOpen]);
```

Puis dans GA4 :

1. Va dans Rapports → Engagement → Événements
2. Filtre sur `video_opened`
3. Multiplie par la taille moyenne de vidéo pour estimer le bandwidth

## Calcul en temps réel

Crée une page admin pour visualiser :

```typescript
// app/admin/bandwidth/page.tsx
import { db } from "~/server/db";

export default async function BandwidthPage() {
  const stats = await db.query.analyticsEvents.findMany({
    where: eq(analyticsEvents.eventType, "video_load"),
    orderBy: desc(analyticsEvents.createdAt),
  });

  const totalBandwidth = stats.reduce(
    (sum, event) => sum + (event.metadata?.size || 0),
    0
  );

  return (
    <div>
      <h1>Bandwidth utilisé ce mois</h1>
      <p>{(totalBandwidth / 1024 / 1024 / 1024).toFixed(2)} GB</p>

      <h2>Par vidéo</h2>
      <ul>
        {stats.map((stat) => (
          <li key={stat.id}>
            {stat.metadata?.url}:{" "}
            {(stat.metadata?.size / 1024 / 1024).toFixed(2)} MB
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Alerte automatique

Configure une alerte Slack/Discord quand le bandwidth dépasse un seuil :

```typescript
// app/api/cron/check-bandwidth/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const bandwidth = await calculateMonthlyBandwidth();
  const limit = 100; // GB pour plan Hobby

  if (bandwidth > limit * 0.8) {
    await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `⚠️ Bandwidth alert: ${bandwidth.toFixed(
          2
        )} GB / ${limit} GB (${((bandwidth / limit) * 100).toFixed(1)}%)`,
      }),
    });
  }

  return NextResponse.json({ bandwidth, limit });
}
```

Configure un Vercel Cron :

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/check-bandwidth",
      "schedule": "0 0 * * *"
    }
  ]
}
```
