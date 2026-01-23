"use client";

import { useState } from "react";
import { BentoIngredients } from "./bento-ingredients";
import { BentoRecette } from "./bento-recette";
import { BentoSourceVideo } from "./bento-sourcevideo";
import { BentoLetmecook } from "./bento-letmecook";

interface RecipeBentoProps {
	recipe: {
		id: string;
		title: string;
		sourcePlatform: "tiktok" | "instagram" | "youtube";
		sourceUrl: string;
		videoUrl: string | null;
		videoUrlExpiresAt?: Date | null;
		imageUrl: string | null;
		imageUrlExpiresAt?: Date | null;
		prepTimeMinutes: number | null;
		cookTimeMinutes: number | null;
		servings: number | null;
		ingredients: Array<{
			name: string;
			quantity?: string;
			unit?: string;
			notes?: string;
		}>;
		steps: Array<{
			order: number;
			instruction: string;
			durationMinutes?: number;
			videoStartTime?: number;
			videoEndTime?: number;
			videoClipUrl?: string;
		}>;
	};
}

export function RecipeBento({ recipe }: RecipeBentoProps) {
	const [showVideo, setShowVideo] = useState(false);
	const [initialStep, setInitialStep] = useState(0);

	const openVideoAtStep = (stepIndex: number) => {
		setInitialStep(stepIndex);
		setShowVideo(true);
	};

	return (
		<div className="h-[calc(100vh-5rem)] px-4 pt-20 pb-4">
			{/* Grille Bento - 3 colonnes, hauteurs égales */}
			<div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
				{/* Colonne gauche - Ingrédients */}
				<div className="md:col-span-3 h-full overflow-hidden">
					<BentoIngredients recipe={recipe} />
				</div>

				{/* Colonne milieu - Recette (plus importante) */}
				<div className="md:col-span-6 h-full overflow-hidden">
					<BentoRecette recipe={recipe} onPlayClick={() => openVideoAtStep(0)} onStepClick={openVideoAtStep} />
				</div>

				{/* Colonne droite - Vidéo (plus petite) */}
				<div className="md:col-span-3 h-full">
					<BentoSourceVideo
						onPlayClick={() => openVideoAtStep(0)}
						thumbnailUrl={recipe.imageUrl ?? undefined}
						videoUrl={recipe.videoUrl ?? undefined}
						sourceUrl={recipe.sourceUrl}
						sourcePlatform={recipe.sourcePlatform}
					/>
				</div>
			</div>

			{/* Player Instagram-like */}
			<BentoLetmecook
				recipe={{
					id: recipe.id,
					title: recipe.title,
					videoUrlExpiresAt: recipe.videoUrlExpiresAt,
					steps: recipe.steps,
				}}
				isOpen={showVideo}
				onClose={() => setShowVideo(false)}
				videoUrl={recipe.videoUrl ?? undefined}
				initialStep={initialStep}
			/>
		</div>
	);
}

export { BentoIngredients } from "./bento-ingredients";
export { BentoRecette } from "./bento-recette";
export { BentoSourceVideo } from "./bento-sourcevideo";
export { BentoLetmecook } from "./bento-letmecook";
