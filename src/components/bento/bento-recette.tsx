"use client";

import { Play } from "lucide-react";

function formatTimecode(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

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
	onStepClick?: (stepIndex: number) => void;
}

export function BentoRecette({ recipe, onPlayClick, onStepClick }: BentoRecetteProps) {
	return (
		<div className="flex flex-col">
			<div className="flex items-center gap-3 mb-4 pb-4 border-b border-foreground/15">
				<h3 className="text-lg font-semibold text-foreground">Recette</h3>
				<div
					className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-foreground/10 cursor-pointer transition-all"
					onClick={onPlayClick}
				>
					<Play className="w-4 h-4 text-foreground/60 ml-0.5" />
				</div>
			</div>

			{/* Étapes - 2 colonnes style cahier */}
			<div className="grid grid-cols-2 gap-x-6">
				{recipe.steps.map((step, i) => (
					<div
						key={i}
						className={`flex gap-3 py-3 border-b border-foreground/10 ${onStepClick ? "cursor-pointer hover:bg-foreground/5 transition-colors" : ""}`}
						onClick={() => onStepClick?.(i)}
					>
						<span className="font-mono text-sm text-muted-foreground/60 w-5 shrink-0">
							{i + 1}.
						</span>
						<div className="flex-1 min-w-0">
							<p className="text-sm text-foreground/80 leading-relaxed">
								{step.instruction}
							</p>
							{step.videoStartTime !== undefined &&
								step.videoEndTime !== undefined && (
									<span className="text-xs font-mono text-muted-foreground/50 mt-0.5 block">
										{formatTimecode(step.videoStartTime)} -{" "}
										{formatTimecode(step.videoEndTime)}
									</span>
								)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
