"use client";

import { useSearchParams } from "next/navigation";
import { RecipeBento } from "@/components/bento";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RecettePage() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id")
    ? Number.parseInt(searchParams.get("id")!)
    : undefined;

  return (
    <main className="min-h-screen bg-background theme-vercel-dark py-8">
      {/* Back button */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour a l'explorer
        </Link>
      </div>

      <RecipeBento recipeId={recipeId} />
    </main>
  );
}
