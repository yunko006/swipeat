"use client";

import { useState } from "react";
import { ChefHat } from "lucide-react";
import { recipes } from "@/lib/recipes-data";
import { BentoIngredients } from "./bento-ingredients";
import { BentoRecette } from "./bento-recette";
import { BentoSourceVideo } from "./bento-sourcevideo";
import { BentoLetmecook } from "./bento-letmecook";

interface RecipeBentoProps {
  recipeId?: number;
}

export function RecipeBento({ recipeId }: RecipeBentoProps) {
  const [showVideo, setShowVideo] = useState(false);
  const recipe = recipeId
    ? recipes.find((r) => r.id === recipeId) || recipes[0]
    : recipes[0];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pt-20">
      {/* Grille Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Colonne gauche */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <BentoIngredients recipe={recipe} />
          <BentoRecette
            recipe={recipe}
            onPlayClick={() => setShowVideo(true)}
          />
        </div>

        {/* Colonne droite - Video */}
        <div className="md:col-span-4 md:row-span-2">
          <BentoSourceVideo onPlayClick={() => setShowVideo(true)} />
        </div>
      </div>

      {/* Player Instagram-like */}
      <BentoLetmecook
        recipe={recipe}
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
      />
    </div>
  );
}

export { BentoIngredients } from "./bento-ingredients";
export { BentoRecette } from "./bento-recette";
export { BentoSourceVideo } from "./bento-sourcevideo";
export { BentoLetmecook } from "./bento-letmecook";
