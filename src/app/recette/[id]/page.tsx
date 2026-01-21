"use client";

import { useParams } from "next/navigation";
import { RecipeBento } from "@/components/bento";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";

export default function RecetteIdPage() {
	const params = useParams();
	const recipeId = params.id as string;
	const { data: session } = useSession();

	const { data: recipe, isLoading } = api.recipe.getById.useQuery({
		id: recipeId,
	});

	const isOwner = session?.user?.id === recipe?.createdByUserId;

	if (isLoading) {
		return (
			<main className="min-h-screen bg-background theme-vercel-dark py-8">
				<div className="max-w-6xl mx-auto px-4 mb-8">
					<Link
						href="/explore"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Retour a l'explorer
					</Link>
				</div>
				<div className="flex items-center justify-center min-h-[400px]">
					<p className="text-muted-foreground">Chargement...</p>
				</div>
			</main>
		);
	}

	if (!recipe) {
		return (
			<main className="min-h-screen bg-background theme-vercel-dark py-8">
				<div className="max-w-6xl mx-auto px-4 mb-8">
					<Link
						href="/explore"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Retour a l'explorer
					</Link>
				</div>
				<div className="flex items-center justify-center min-h-[400px]">
					<p className="text-muted-foreground">Recette non trouvée</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background theme-vercel-dark py-8">
			{/* Header with back button and edit */}
			<div className="max-w-6xl mx-auto px-4 mb-8 flex items-center justify-between">
				<Link
					href="/explore"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Retour a l'explorer
				</Link>

				{isOwner && (
					<Link
						href={`/recette/${recipeId}/edit`}
						className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-foreground/5 transition-colors"
					>
						<Pencil className="w-4 h-4" />
						Editer les timings
					</Link>
				)}
			</div>

			<RecipeBento recipe={recipe} />
		</main>
	);
}
