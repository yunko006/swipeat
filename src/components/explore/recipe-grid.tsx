// ABOUTME: Recipe grid component with loading and empty states
// ABOUTME: Displays recipes in responsive grid layout with appropriate fallbacks

import { ChefHat } from "lucide-react";
import { RecipeCard } from "./recipe-card";

interface Recipe {
  id: string;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  sourcePlatform: "tiktok" | "instagram" | "youtube";
  createdBy: {
    name: string | null;
    image: string | null;
  } | null;
}

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading: boolean;
  total?: number;
}

export function RecipeGrid({ recipes, isLoading, total = 0 }: RecipeGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-20">
        <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Aucune recette trouvee
        </h3>
        <p className="text-muted-foreground">
          Essayez de modifier vos criteres de recherche
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">
        {total} recette{total > 1 ? "s" : ""} trouvee{total > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </>
  );
}
