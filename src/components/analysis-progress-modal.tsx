// ABOUTME: Modal showing video analysis progress steps
// ABOUTME: Displays checkmarks for completed steps during Twelve Labs analysis

"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Circle } from "lucide-react";

export type AnalysisStep = "upload" | "indexing" | "analyzing" | "complete";

export interface AnalysisProgressModalProps {
	isOpen: boolean;
	isComplete: boolean;
	error?: string | null;
}

const STEPS: { key: AnalysisStep; label: string; estimatedDurationMs: number }[] = [
	{ key: "upload", label: "Envoi de la vidéo", estimatedDurationMs: 2000 },
	{ key: "indexing", label: "Indexation en cours", estimatedDurationMs: 30000 },
	{ key: "analyzing", label: "Analyse des timestamps", estimatedDurationMs: 10000 },
	{ key: "complete", label: "Terminé", estimatedDurationMs: 0 },
];

function getStepStatus(
	stepKey: AnalysisStep,
	currentStep: AnalysisStep,
): "done" | "current" | "pending" {
	const stepOrder = STEPS.findIndex((s) => s.key === stepKey);
	const currentOrder = STEPS.findIndex((s) => s.key === currentStep);

	if (stepOrder < currentOrder) return "done";
	if (stepOrder === currentOrder) return "current";
	return "pending";
}

export function AnalysisProgressModal({
	isOpen,
	isComplete,
	error,
}: AnalysisProgressModalProps) {
	const [currentStep, setCurrentStep] = useState<AnalysisStep>("upload");

	useEffect(() => {
		if (!isOpen) {
			setCurrentStep("upload");
			return;
		}

		if (isComplete) {
			setCurrentStep("complete");
			return;
		}

		// Simulate progression based on estimated durations
		// TODO: Replace with real polling - see docs/polling-implementation.md
		let totalDelay = 0;
		const timeouts: NodeJS.Timeout[] = [];

		for (let i = 0; i < STEPS.length - 1; i++) {
			const step = STEPS[i]!;
			totalDelay += step.estimatedDurationMs;

			const nextStep = STEPS[i + 1];
			if (nextStep && nextStep.key !== "complete") {
				const timeout = setTimeout(() => {
					setCurrentStep(nextStep.key);
				}, totalDelay);
				timeouts.push(timeout);
			}
		}

		return () => {
			timeouts.forEach(clearTimeout);
		};
	}, [isOpen, isComplete]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-background rounded-lg max-w-md w-full p-6">
				<h2 className="text-lg font-semibold mb-6">Analyse de la vidéo</h2>

				<div className="space-y-4">
					{STEPS.map((step) => {
						const status = getStepStatus(step.key, currentStep);

						return (
							<div key={step.key} className="flex items-center gap-3">
								{status === "done" && (
									<div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
										<Check className="w-4 h-4 text-white" />
									</div>
								)}
								{status === "current" && (
									<div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
										<Loader2 className="w-4 h-4 text-white animate-spin" />
									</div>
								)}
								{status === "pending" && (
									<div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
										<Circle className="w-3 h-3 text-muted-foreground/30" />
									</div>
								)}
								<span
									className={
										status === "pending"
											? "text-muted-foreground"
											: "text-foreground"
									}
								>
									{step.label}
								</span>
							</div>
						);
					})}
				</div>

				{error && (
					<div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
						<p className="text-sm text-red-500">{error}</p>
					</div>
				)}
			</div>
		</div>
	);
}
