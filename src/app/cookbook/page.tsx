"use client";

import { useState } from "react";
import { ChefHat, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { ProfileCard } from "@/components/cookbook/profil-card";
import { TabsNavigation } from "@/components/cookbook/tabs-navigation";
import { RecipeGrid } from "@/components/cookbook/recipe-grid";
import { EmptyState } from "@/components/cookbook/empty-state";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";

type Tab = "likes" | "imports" | "historique";

export default function cookbookPage() {
  const [activeTab, setActiveTab] = useState<Tab>("likes");
  const { data: session } = useSession();

  const { data: savedRecipes = [], isLoading: isLoadingSaved } =
    api.savedRecipes.getUserSavedRecipes.useQuery(undefined, {
      enabled: !!session,
    });

  const { data: importedRecipes = [], isLoading: isLoadingImported } =
    api.recipe.getUserImportedRecipes.useQuery(undefined, {
      enabled: !!session,
    });

  const userData = {
    name: session?.user?.name ?? "Utilisateur",
    username: session?.user?.email ?? "",
    avatar: session?.user?.image ?? "/diverse-woman-avatar.png",
    stats: {
      likes: savedRecipes.length,
      imports: importedRecipes.length,
      historique: 0,
    },
  };

  const getRecipesForTab = () => {
    switch (activeTab) {
      case "likes":
        return savedRecipes;
      case "imports":
        return importedRecipes;
      case "historique":
        return [];
      default:
        return [];
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "likes":
        return isLoadingSaved;
      case "imports":
        return isLoadingImported;
      case "historique":
        return false;
      default:
        return false;
    }
  };

  const filteredRecipes = getRecipesForTab();
  const loading = isLoading();

  return (
    <div className="min-h-screen bg-background theme-vercel-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Explore</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-foreground" />
            <span className="text-xl font-bold text-foreground">letmecook</span>
          </Link>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ProfileCard
          user={userData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-card border border-border rounded-xl overflow-hidden animate-pulse"
              >
                <div className="w-full h-full bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <RecipeGrid recipes={filteredRecipes} activeTab={activeTab} />
        ) : (
          <EmptyState activeTab={activeTab} />
        )}
      </main>
    </div>
  );
}
