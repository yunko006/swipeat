"use client";

import { Clock, Heart, Play, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";

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

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(() => undefined);
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave.mutate({ recipeId: recipe.id });
  };

  return (
    <Link href={`/recette/${recipe.id}`}>
      <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-foreground/30">
        {/* Thumbnail avec overlay */}
        <div
          className="relative aspect-3/4 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={recipe.videoUrl ?? undefined}
            muted
            playsInline
            loop
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          {/* Platform badge */}
          <div className="absolute top-3 left-3">
            <span className="rounded-full border border-white/20 bg-black/40 px-2 py-1 font-medium text-white text-xs capitalize backdrop-blur-sm">
              {recipe.sourcePlatform}
            </span>
          </div>

          {/* Save button */}
          <button
            aria-label={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
            onClick={handleSaveClick}
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                isSaved ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>

          {/* Content overlay */}
          <div className="absolute right-0 bottom-0 left-0 p-4">
            {/* Author */}
            {recipe.createdBy?.name && (
              <p className="mb-1 text-white/70 text-xs">
                {recipe.createdBy.name}
              </p>
            )}

            {/* Title */}
            <h3 className="mb-2 line-clamp-2 font-semibold text-lg text-white leading-tight">
              {recipe.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-3 text-white/70 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{displayTime}</span>
              </div>
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{recipe.servings} pers.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ligne style carnet en bas */}
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-linear-to-r from-rose-500/50 via-transparent to-transparent" />
      </div>
    </Link>
  );
}
