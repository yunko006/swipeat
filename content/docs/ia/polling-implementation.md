# Implémentation du Polling pour l'Analyse Vidéo

## Contexte

Actuellement, le modal `AnalysisProgressModal` simule la progression basée sur des durées estimées. Cette approche fonctionne mais n'est pas précise - les étapes peuvent prendre plus ou moins de temps que prévu.

Pour une meilleure UX, on devrait implémenter un vrai système de polling qui récupère le statut réel depuis Twelve Labs.

## Architecture Actuelle (Simulée)

```
Client                          Server
  |                                |
  |-- reanalyzeTimings.mutate() -->|
  |                                |-- uploadVideoToTwelveLabs()
  |   (simule progression          |-- waitForDone() (polling interne)
  |    avec timeouts)              |-- twelveLabsClient.analyze()
  |                                |
  |<-- { newSteps } ---------------|
```

Le problème : le client n'a aucune visibilité sur ce qui se passe côté serveur pendant l'attente.

## Architecture Cible (Avec Polling)

```
Client                          Server                    DB
  |                                |                        |
  |-- startAnalysis.mutate() ----->|                        |
  |                                |-- créer analysisTask -->|
  |<-- { taskId } -----------------|                        |
  |                                |                        |
  |   (background job)             |-- uploadVideo          |
  |                                |-- update status ------>|
  |                                |-- waitForDone          |
  |                                |-- update status ------>|
  |                                |-- analyze              |
  |                                |-- update status ------>|
  |                                |                        |
  |-- getAnalysisStatus(taskId) -->|                        |
  |<-- { status: "indexing" } -----|<-- read status --------|
  |                                |                        |
  |-- getAnalysisStatus(taskId) -->|                        |
  |<-- { status: "analyzing" } ----|<-- read status --------|
  |                                |                        |
  |-- getAnalysisStatus(taskId) -->|                        |
  |<-- { status: "complete",   ----|<-- read status --------|
  |      newSteps: [...] }         |                        |
```

## Étapes d'Implémentation

### 1. Créer une table `analysis_tasks`

```typescript
// src/server/db/schema/analysis-tasks.ts
export const analysisTasks = pgTableCreator((name) => `swipeat_${name}`)("analysis_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipeId: uuid("recipe_id").references(() => recipes.id).notNull(),
  status: text("status").notNull(), // "pending" | "uploading" | "indexing" | "analyzing" | "complete" | "error"
  error: text("error"),
  result: jsonb("result"), // Les nouveaux steps une fois terminé
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 2. Créer les mutations tRPC

```typescript
// Dans recipe.router.ts

// Démarre l'analyse et retourne immédiatement un taskId
startAnalysis: protectedProcedure
  .input(z.object({ recipeId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Créer la tâche en DB
    const [task] = await ctx.db.insert(analysisTasks).values({
      recipeId: input.recipeId,
      status: "pending",
    }).returning();

    // Lancer le job en background (voir étape 3)
    await triggerAnalysisJob(task.id);

    return { taskId: task.id };
  }),

// Récupère le statut actuel
getAnalysisStatus: protectedProcedure
  .input(z.object({ taskId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    const task = await ctx.db.query.analysisTasks.findFirst({
      where: eq(analysisTasks.id, input.taskId),
    });

    return {
      status: task?.status,
      error: task?.error,
      newSteps: task?.status === "complete" ? task.result : null,
    };
  }),
```

### 3. Créer le background job

Option A: Utiliser une API route avec `waitUntil` (Vercel)

```typescript
// src/app/api/analyze/route.ts
import { waitUntil } from '@vercel/functions';

export async function POST(req: Request) {
  const { taskId } = await req.json();

  waitUntil(runAnalysis(taskId));

  return Response.json({ started: true });
}

async function runAnalysis(taskId: string) {
  try {
    await updateTaskStatus(taskId, "uploading");
    const videoId = await uploadVideoToTwelveLabs(videoUrl);

    await updateTaskStatus(taskId, "indexing");
    // waitForDone est déjà appelé dans uploadVideoToTwelveLabs

    await updateTaskStatus(taskId, "analyzing");
    const timestamps = await analyzeWithTwelveLabs(videoId, steps);

    await updateTaskStatus(taskId, "complete", { result: newSteps });
  } catch (error) {
    await updateTaskStatus(taskId, "error", { error: error.message });
  }
}
```

Option B: Utiliser Inngest ou Trigger.dev pour les background jobs (plus robuste)

### 4. Modifier le composant client

```typescript
// Dans la page edit
const [taskId, setTaskId] = useState<string | null>(null);

const { data: analysisStatus } = api.recipe.getAnalysisStatus.useQuery(
  { taskId: taskId! },
  {
    enabled: !!taskId,
    refetchInterval: (data) => {
      // Arrêter le polling quand terminé ou erreur
      if (data?.status === "complete" || data?.status === "error") {
        return false;
      }
      return 3000; // Poll toutes les 3 secondes
    },
  }
);

const handleReanalyze = async () => {
  const { taskId } = await startAnalysis.mutateAsync({ recipeId });
  setTaskId(taskId);
  setShowAnalysisModal(true);
};

// Dans le modal
<AnalysisProgressModal
  isOpen={showAnalysisModal}
  currentStep={analysisStatus?.status ?? "pending"}
  isComplete={analysisStatus?.status === "complete"}
  error={analysisStatus?.error}
/>
```

### 5. Modifier le composant AnalysisProgressModal

Supprimer la logique de simulation par timeouts et utiliser directement la prop `currentStep` passée par le parent.

## Considérations

- **Cleanup**: Supprimer les anciennes tâches après X jours
- **Timeout**: Marquer comme erreur si pas de mise à jour depuis X minutes
- **Retry**: Permettre de relancer une analyse échouée
- **Concurrent**: Empêcher plusieurs analyses simultanées pour la même recette

## Amélioration UX : Toast au lieu de Modal

Actuellement, le modal de progression bloque la navigation. Une meilleure approche serait d'utiliser un toast Sonner en bas à droite qui permet à l'utilisateur de continuer à naviguer pendant l'analyse.

### Avantages

- L'utilisateur peut parcourir d'autres recettes pendant l'analyse
- Moins intrusif qu'un modal plein écran
- Peut afficher plusieurs analyses en parallèle si nécessaire

### Implémentation suggérée

```typescript
// Utiliser sonner pour les notifications
import { toast } from "sonner";

const handleReanalyze = async () => {
  const { taskId } = await startAnalysis.mutateAsync({ recipeId });

  // Afficher un toast persistant avec la progression
  toast.promise(
    pollUntilComplete(taskId),
    {
      loading: "Analyse en cours...",
      success: "Analyse terminée ! Les nouveaux timings sont disponibles.",
      error: "L'analyse a échoué. Veuillez réessayer.",
    }
  );

  // Permettre la navigation immédiate
};

// Ou avec un toast custom pour plus de contrôle
const toastId = toast.loading("Envoi de la vidéo...", {
  duration: Infinity, // Persistant jusqu'à fermeture manuelle
});

// Mettre à jour le toast selon le statut
useEffect(() => {
  if (analysisStatus?.status === "indexing") {
    toast.loading("Indexation en cours...", { id: toastId });
  } else if (analysisStatus?.status === "analyzing") {
    toast.loading("Analyse des timestamps...", { id: toastId });
  } else if (analysisStatus?.status === "complete") {
    toast.success("Analyse terminée !", { id: toastId });
    // Optionnel: invalider le cache pour rafraîchir les données
    utils.recipe.getById.invalidate({ id: recipeId });
  }
}, [analysisStatus]);
```

### Dépendances

- Nécessite le polling en background (voir sections précédentes)
- Sonner est déjà installé via shadcn/ui

### Notes

- Le toast devrait inclure un bouton pour voir les résultats une fois terminé
- Considérer stocker le taskId dans localStorage pour survivre aux rechargements de page
- Afficher une notification si l'utilisateur revient sur la page après que l'analyse soit terminée

## Priorité

Cette amélioration est nice-to-have. La simulation actuelle fonctionne suffisamment bien pour le MVP. À implémenter quand:
- Les utilisateurs se plaignent que la progression n'est pas précise
- On veut afficher des messages d'erreur plus détaillés
- On a besoin de retry sur les analyses échouées
