"use client";

import { Play } from "lucide-react";

interface BentoRecetteProps {
	recipe: {
		steps: Array<{
			order: number;
			instruction: string;
			durationMinutes?: number;
			videoStartTime?: number;
			videoEndTime?: number;
			videoClipUrl?: string;
		}>;
	};
	onPlayClick: () => void;
}

export function BentoRecette({ recipe, onPlayClick }: BentoRecetteProps) {
	return (
		<div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all flex-1">
			{/* Marge rouge */}
			<div className="absolute left-8 top-0 bottom-0 w-px bg-rose-500/40" />

			{/* Trous de reliure */}
			<div className="absolute left-2 top-[15%] w-3 h-3 rounded-full border-2 border-foreground/20" />
			<div className="absolute left-2 top-[45%] w-3 h-3 rounded-full border-2 border-foreground/20" />
			<div className="absolute left-2 top-[75%] w-3 h-3 rounded-full border-2 border-foreground/20" />

			<div className="p-6 pl-12">
				<div className="flex items-center gap-3 mb-4 pb-4 border-b border-foreground/15">
					<h3 className="text-lg font-semibold text-foreground">Recette</h3>
					<div
						className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-foreground/10 cursor-pointer transition-all"
						onClick={onPlayClick}
					>
						<Play className="w-4 h-4 text-foreground/60 ml-0.5" />
					</div>
				</div>

				<ol className="space-y-0">
					{recipe.steps.map((step, i) => (
						<li
							key={i}
							className="flex gap-4 py-4 border-b border-foreground/10 last:border-b-0"
						>
							<span className="font-mono text-lg text-muted-foreground/60 w-6 shrink-0">
								{i})
							</span>
							<p className="text-sm text-foreground/80 leading-relaxed">
								{step.instruction}
							</p>
						</li>
					))}
				</ol>
			</div>
		</div>
	);
}
