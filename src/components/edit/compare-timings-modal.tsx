// ABOUTME: Modal to compare current vs new timings from Twelve Labs re-analysis
// ABOUTME: Allows user to choose between keeping current or applying new timings

"use client";

import { X, Check } from "lucide-react";
import { type Step } from "./types";

interface CompareTimingsModalProps {
	currentSteps: Step[];
	newSteps: Step[];
	onApply: () => void;
	onCancel: () => void;
}

export function CompareTimingsModal({
	currentSteps,
	newSteps,
	onApply,
	onCancel,
}: CompareTimingsModalProps) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-background rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
				<div className="flex items-center justify-between p-4 border-b">
					<h2 className="text-lg font-semibold">Comparer les timings</h2>
					<button
						onClick={onCancel}
						className="p-2 hover:bg-muted rounded-lg transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="overflow-y-auto flex-1 p-4">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-muted-foreground border-b">
								<th className="pb-2 font-medium">Étape</th>
								<th className="pb-2 font-medium">Actuels</th>
								<th className="pb-2 font-medium">Nouveaux</th>
							</tr>
						</thead>
						<tbody>
							{currentSteps.map((step, index) => {
								const newStep = newSteps[index];
								const currentStart = step.videoStartTime;
								const currentEnd = step.videoEndTime;
								const newStart = newStep?.videoStartTime;
								const newEnd = newStep?.videoEndTime;
								const hasChanged =
									currentStart !== newStart || currentEnd !== newEnd;

								return (
									<tr
										key={step.order}
										className={`border-b ${hasChanged ? "bg-yellow-500/10" : ""}`}
									>
										<td className="py-3 pr-4">
											<span className="text-muted-foreground mr-2">
												{step.order}.
											</span>
											{step.instruction.substring(0, 50)}
											{step.instruction.length > 50 ? "..." : ""}
										</td>
										<td className="py-3 pr-4 font-mono">
											{currentStart != null && currentEnd != null
												? `${currentStart}s - ${currentEnd}s`
												: "—"}
										</td>
										<td className="py-3 font-mono">
											{newStart != null && newEnd != null
												? `${newStart}s - ${newEnd}s`
												: "—"}
											{hasChanged && (
												<span className="ml-2 text-yellow-500">●</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				<div className="flex items-center justify-end gap-2 p-4 border-t">
					<button
						onClick={onCancel}
						className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
					>
						Garder les actuels
					</button>
					<button
						onClick={onApply}
						className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
					>
						<Check className="w-4 h-4" />
						Appliquer les nouveaux
					</button>
				</div>
			</div>
		</div>
	);
}
