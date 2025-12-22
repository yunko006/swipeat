---
title: Architecture vidéo
description: Loop sur vidéo complète
---

Au lieu de découper physiquement les vidéos en clips séparés, Swipeat utilise une approche plus simple et économique.

### Comment ça fonctionne

- La vidéo Instagram complète est chargée une seule fois
- Le player vidéo utilise `video.currentTime` pour looper entre `videoStartTime` et `videoEndTime` de chaque étape
- Implémentation dans `src/components/bento/bento-letmecook.tsx` avec event listener `timeupdate`

### Code simplifié

```typescript
useEffect(() => {
  const handleTimeUpdate = () => {
    const { videoStartTime, videoEndTime } = recipe.steps[currentStep];

    if (videoStartTime !== undefined && videoEndTime !== undefined) {
      // Buffer de 0.1s pour capturer la fin avant overshoot
      if (
        video.currentTime >= videoEndTime - 0.1 ||
        video.currentTime < videoStartTime
      ) {
        video.currentTime = videoStartTime; // Loop
      }
    }
  };

  video.addEventListener("timeupdate", handleTimeUpdate);
  return () => video.removeEventListener("timeupdate", handleTimeUpdate);
}, [currentStep, recipe.steps]);
```

## Avantages de cette approche

✅ **Zero processing backend** - Pas de FFmpeg, pas de stockage de clips
✅ **Implémentation immédiate** - Fonctionne dès que les timestamps sont extraits
✅ **Pas de coûts de stockage** - Pas de multiplication des fichiers
✅ **Transitions fluides** - Même fichier vidéo, pas de coupure entre étapes
✅ **Idéal pour vidéos courtes** - Instagram/TikTok font ~30-60s

## Inconvénients potentiels

⚠️ **Bandwidth** - Le navigateur télécharge toute la vidéo même si l'utilisateur ne regarde que quelques étapes
⚠️ **Seeking imprécis** - Buffer de 0.1s nécessaire car `timeupdate` ne se déclenche pas à chaque frame (~250ms)
⚠️ **Navigation rapide** - Peut être saccadé sur connexion lente si l'utilisateur swipe rapidement

## Quand considérer le découpage en clips ?

Passer au découpage physique si :

1. **Les données analytiques** montrent qu'une majorité d'utilisateurs abandonnent avant la fin (bandwidth gaspillé)
2. **Vidéos longues** - Les vidéos dépassent 2-3 minutes (rare sur Instagram/TikTok)
3. **Plaintes utilisateurs** - Les retours sur la performance deviennent fréquents

## Alternative future : Approche hybride

Cette approche combine les avantages des deux solutions :

1. **Premier chargement** - Garder la vidéo complète pour démarrage rapide
2. **Génération asynchrone** - Générer les clips en arrière-plan
3. **Migration progressive** - Basculer sur les clips pour les recettes populaires
4. **Préchargement intelligent** - Précharger step N+1 pendant que l'utilisateur regarde step N

### Exemple d'implémentation hybride

```typescript
// Charger la vidéo complète immédiatement
const fullVideo = recipe.videoUrl;

// En parallèle, vérifier si des clips sont disponibles
const clips = await checkIfClipsExist(recipe.id);

if (clips) {
  // Basculer vers les clips après chargement
  useClips(clips);
} else {
  // Générer les clips en arrière-plan
  generateClipsAsync(recipe.id);
}
```

## Hébergement vidéo

### Actuel (MVP)

- **Source** : URL directe depuis Instagram
- **Coût** : Gratuit (pas de re-upload)
- **Limitation** : Dépend de la disponibilité Instagram

### Future

- **Cloudflare R2** : Stockage gratuit jusqu'à 10 GB, bandwidth de sortie gratuit illimité
- **Vercel Blob** : Plus simple mais payant au-delà du plan gratuit
- **BunnyCDN** : Très économique ($0.01/GB)

## Bandwidth et performance

Voir la page [Bandwidth et coûts](/docs/video/bandwidth) pour comprendre l'impact sur les coûts d'infrastructure.
