import Link from "next/link";
import { Heart, History, Clock, Users, Play } from "lucide-react";
import type { Recipe } from "@/lib/types/recipe";

type Tab = "likes" | "imports" | "historique";

interface RecipeGridProps {
  recipes: Recipe[];
  activeTab: Tab;
}

export function RecipeGrid({ recipes, activeTab }: RecipeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {recipes.map((recipe) => {
        const totalTime =
          (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
        const displayTime = totalTime > 0 ? `${totalTime} min` : "N/A";

        return (
          <Link href={`/recette/${recipe.id}`} key={recipe.id}>
            <div className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/30 transition-all">
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={recipe.imageUrl || "/placeholder.svg"}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Badge selon le tab */}
                {activeTab === "likes" && (
                  <div className="absolute top-2 right-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  </div>
                )}
                {activeTab === "imports" && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-foreground/90 rounded-full">
                    <span className="text-xs text-background font-medium">
                      Import
                    </span>
                  </div>
                )}
                {activeTab === "historique" && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full flex items-center gap-1">
                    <History className="w-3 h-3 text-white/70" />
                    <span className="text-xs text-white/70">Vu</span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{displayTime}</span>
                    </div>
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{recipe.servings}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ligne style carnet */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-rose-500/50 via-transparent to-transparent" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
