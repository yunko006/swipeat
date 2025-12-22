// ABOUTME: Header component for explore page with logo and CTA button
// ABOUTME: Includes navigation to home and add recipe functionality

import Link from "next/link";
import { ChefHat } from "lucide-react";

export function ExploreHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <Link href="/" className="flex items-center gap-2">
        <ChefHat className="w-6 h-6 text-foreground" />
        <span className="text-xl font-bold text-foreground">letmecook</span>
      </Link>
      <Link
        href="/"
        className="px-4 py-2 text-sm border border-border rounded-full hover:bg-secondary transition-colors text-foreground"
      >
        Ajouter une recette
      </Link>
    </div>
  );
}
