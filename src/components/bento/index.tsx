"use client";

// ABOUTME: Page recette — layout cahier centré, ingrédients puis étapes
// ABOUTME: BentoLetmecook accessible via le bouton Play dans les étapes

import { useState } from "react";
import { BentoIngredients } from "./bento-ingredients";
import { BentoRecette } from "./bento-recette";
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
		<div className="min-h-[calc(100vh-5rem)] px-4 pt-20 pb-8">
			<div className="max-w-3xl mx-auto">
				{/* Card cahier unique */}
				<div className="relative bg-card border border-border rounded-2xl overflow-hidden">
					{/* Marge rouge - style cahier */}
					<div className="absolute left-8 top-0 bottom-0 w-px bg-rose-500/40" />

					{/* Trous de reliure */}
					<div className="absolute left-2 top-[15%] w-3 h-3 rounded-full border-2 border-foreground/20" />
					<div className="absolute left-2 top-[45%] w-3 h-3 rounded-full border-2 border-foreground/20" />
					<div className="absolute left-2 top-[75%] w-3 h-3 rounded-full border-2 border-foreground/20" />

					<div className="p-6 pl-12">
						<BentoIngredients recipe={recipe} />
						<div className="my-6" />
						<BentoRecette
							recipe={recipe}
							onPlayClick={() => openVideoAtStep(0)}
							onStepClick={openVideoAtStep}
						/>
					</div>
				</div>
			</div>

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
