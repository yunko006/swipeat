import Link from "next/link";
import { Heart, Upload, History, ChefHat } from "lucide-react";

type Tab = "likes" | "imports" | "historique";

interface EmptyStateProps {
  activeTab: Tab;
}

export function EmptyState({ activeTab }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
        {activeTab === "likes" && (
          <Heart className="w-8 h-8 text-muted-foreground" />
        )}
        {activeTab === "imports" && (
          <Upload className="w-8 h-8 text-muted-foreground" />
        )}
        {activeTab === "historique" && (
          <History className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {activeTab === "likes" && "Aucune recette likee"}
        {activeTab === "imports" && "Aucune recette importee"}
        {activeTab === "historique" && "Aucun historique"}
      </h3>
      <p className="text-muted-foreground mb-6">
        {activeTab === "likes" && "Les recettes que tu likes apparaitront ici"}
        {activeTab === "imports" &&
          "Importe ta premiere recette depuis Instagram ou TikTok"}
        {activeTab === "historique" &&
          "Les recettes que tu consultes apparaitront ici"}
      </p>
      <Link
        href={activeTab === "imports" ? "/nouvelle-recette" : "/explorer"}
        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-colors"
      >
        {activeTab === "imports" ? (
          <>
            <Upload className="w-4 h-4" />
            Importer une recette
          </>
        ) : (
          <>
            <ChefHat className="w-4 h-4" />
            Explorer les recettes
          </>
        )}
      </Link>
    </div>
  );
}
