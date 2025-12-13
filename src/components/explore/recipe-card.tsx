"use client";

import { Heart, Clock, Users, Play } from "lucide-react";
import Link from "next/link";
import type { Recipe } from "@/lib/recipes-data";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recette?id=${recipe.id}`}>
      <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/30 transition-all cursor-pointer">
        {/* Thumbnail avec overlay */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={recipe.thumbnail || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 text-xs font-medium bg-black/40 backdrop-blur-sm rounded-full text-white border border-white/20">
              {recipe.category}
            </span>
          </div>

          {/* Likes */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span className="text-xs text-white">
              {recipe.likes?.toLocaleString()}
            </span>
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Author */}
            <p className="text-xs text-white/70 mb-1">{recipe.author}</p>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white leading-tight mb-2 line-clamp-2">
              {recipe.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{recipe.prepTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{recipe.servings} pers.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne style carnet en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/50 via-transparent to-transparent" />
      </div>
    </Link>
  );
}
