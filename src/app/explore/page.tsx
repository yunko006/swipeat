"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChefHat,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { recipes } from "@/lib/recipes-data";
import { RecipeCard } from "@/components/explore/recipe-card";

const categories = [
  "Tout",
  "Dessert",
  "Plat",
  "Asiatique",
  "Italien",
  "Mexicain",
  "Indien",
  "Boulangerie",
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [sortBy, setSortBy] = useState<"trending" | "recent" | "quick">(
    "trending"
  );

  const filteredRecipes = recipes
    .filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tout" || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "trending") return (b.likes || 0) - (a.likes || 0);
      if (sortBy === "quick") {
        const aTime = Number.parseInt(a.prepTime) || 0;
        const bTime = Number.parseInt(b.prepTime) || 0;
        return aTime - bTime;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-background theme-vercel-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-foreground" />
              <span className="text-xl font-bold text-foreground">
                letmecook
              </span>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm border border-border rounded-full hover:bg-secondary transition-colors text-foreground"
            >
              Ajouter une recette
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une recette, un ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-background rounded-lg transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Sort options */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm text-muted-foreground">Trier par:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("trending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                sortBy === "trending"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Tendances
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                sortBy === "recent"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Recentes
            </button>
            <button
              onClick={() => setSortBy("quick")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                sortBy === "quick"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              Rapides
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filteredRecipes.length} recette
          {filteredRecipes.length > 1 ? "s" : ""} trouvee
          {filteredRecipes.length > 1 ? "s" : ""}
        </p>

        {/* Recipes grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {/* Empty state */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-20">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucune recette trouvee
            </h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos criteres de recherche
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
