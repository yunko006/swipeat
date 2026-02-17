"use client";

import { Heart, Clock, Users, Play } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";

interface RecipeCardProps {
  recipe: {
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
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  const displayTime = totalTime > 0 ? `${totalTime} min` : "Temps non spécifié";

  const { data: savedData } = api.savedRecipes.isSaved.useQuery({
    recipeId: recipe.id,
  });
  const [isSaved, setIsSaved] = useState(savedData?.saved ?? false);

  useEffect(() => {
    if (savedData) {
      setIsSaved(savedData.saved);
    }
  }, [savedData]);

  const toggleSave = api.savedRecipes.toggle.useMutation({
    onMutate: () => {
      setIsSaved((prev) => !prev);
    },
    onError: () => {
      setIsSaved((prev) => !prev);
    },
  });

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ recipeId: recipe.id });
  };

  return (
    <Link href={`/recette/${recipe.id}`}>
      <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/30 transition-all cursor-pointer">
        {/* Thumbnail avec overlay */}
        <div className="relative aspect-3/4 overflow-hidden">
          <video
            src={recipe.videoUrl || "/placeholder.svg"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Platform badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 text-xs font-medium bg-black/40 backdrop-blur-sm rounded-full text-white border border-white/20 capitalize">
              {recipe.sourcePlatform}
            </span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveClick}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/60 transition-colors z-10"
            aria-label={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                isSaved ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Author */}
            {recipe.createdBy?.name && (
              <p className="text-xs text-white/70 mb-1">
                {recipe.createdBy.name}
              </p>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-white leading-tight mb-2 line-clamp-2">
              {recipe.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{displayTime}</span>
              </div>
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{recipe.servings} pers.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ligne style carnet en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-rose-500/50 via-transparent to-transparent" />
      </div>
    </Link>
  );
}
