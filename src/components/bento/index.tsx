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

	return (
		<div className="max-w-6xl mx-auto py-8 px-4 pt-20">
			{/* Grille Bento */}
			<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
				{/* Colonne gauche */}
				<div className="md:col-span-8 flex flex-col gap-4">
					<BentoIngredients recipe={recipe} />
					<BentoRecette recipe={recipe} onPlayClick={() => setShowVideo(true)} />
				</div>

				{/* Colonne droite - Video */}
				<div className="md:col-span-4 md:row-span-2">
					<BentoSourceVideo
						onPlayClick={() => setShowVideo(true)}
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
			/>
		</div>
	);
}

export { BentoIngredients } from "./bento-ingredients";
export { BentoRecette } from "./bento-recette";
export { BentoSourceVideo } from "./bento-sourcevideo";
export { BentoLetmecook } from "./bento-letmecook";
