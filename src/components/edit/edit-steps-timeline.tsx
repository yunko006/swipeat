// ABOUTME: Unified steps and timeline component for timing editor
// ABOUTME: Each step row integrates its timeline bar, instruction, and timing controls

"use client";

import { Play, Pause } from "lucide-react";
import { type Step, getStepColor, formatTimecode } from "./types";

interface EditStepsTimelineProps {
	steps: Step[];
	selectedStep: number;
	currentTime: number;
	videoDuration: number;
	isPlaying: boolean;
	onSelectStep: (index: number) => void;
	onSeek: (time: number) => void;
	onUpdateTiming: (
		stepIndex: number,
		field: "videoStartTime" | "videoEndTime",
		value: number,
	) => void;
	onSetCurrentTimeAsStart: () => void;
	onSetCurrentTimeAsEnd: () => void;
	onTogglePlayPause: () => void;
}

export function EditStepsTimeline({
	steps,
	selectedStep,
	currentTime,
	videoDuration,
	isPlaying,
	onSelectStep,
	onSeek,
	onUpdateTiming,
	onSetCurrentTimeAsStart,
	onSetCurrentTimeAsEnd,
	onTogglePlayPause,
}: EditStepsTimelineProps) {
	const currentTimePercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

	const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		onSeek(percent * videoDuration);
	};

	return (
		<div className="bg-card border border-border rounded-xl overflow-hidden">
			{/* Header with play controls and current time */}
			<div className="p-4 border-b border-border flex items-center gap-4">
				<button
					onClick={onTogglePlayPause}
					className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors shrink-0"
				>
					{isPlaying ? (
						<Pause className="w-5 h-5 text-foreground" />
					) : (
						<Play className="w-5 h-5 text-foreground ml-0.5" />
					)}
				</button>

				<span className="font-mono text-lg">
					{formatTimecode(currentTime)} / {formatTimecode(videoDuration)}
				</span>

				{/* Quick actions for selected step */}
				<div className="flex gap-2 ml-auto">
					<button
						onClick={onSetCurrentTimeAsStart}
						className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
					>
						Debut = {formatTimecode(currentTime)}
					</button>
					<button
						onClick={onSetCurrentTimeAsEnd}
						className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
					>
						Fin = {formatTimecode(currentTime)}
					</button>
				</div>
			</div>

			{/* Steps list with integrated timeline */}
			<div className="divide-y divide-border max-h-[calc(100vh-300px)] overflow-y-auto">
				{steps.map((step, i) => {
					const color = getStepColor(i);
					const isSelected = i === selectedStep;
					const hasTimings =
						step.videoStartTime !== undefined && step.videoEndTime !== undefined;
					const startPercent = hasTimings
						? (step.videoStartTime! / videoDuration) * 100
						: 0;
					const endPercent = hasTimings
						? (step.videoEndTime! / videoDuration) * 100
						: 0;
					const width = endPercent - startPercent;

					return (
						<div
							key={i}
							className={`p-3 cursor-pointer transition-all ${
								isSelected
									? "bg-foreground/10"
									: "opacity-60 hover:opacity-100 hover:bg-foreground/5"
							}`}
							onClick={() => {
								onSelectStep(i);
								if (step.videoStartTime !== undefined) {
									onSeek(step.videoStartTime);
								}
							}}
						>
							{/* Timeline bar */}
							<div className="flex items-center gap-2 mb-2">
								<div
									className={`w-6 h-6 rounded-full ${color.bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}
								>
									{i}
								</div>

								<div
									className="flex-1 h-5 bg-foreground/10 rounded cursor-pointer relative"
									onClick={(e) => {
										e.stopPropagation();
										handleTimelineClick(e);
									}}
								>
									{/* Step range */}
									{hasTimings && (
										<div
											className={`absolute top-0 h-full ${color.range} rounded`}
											style={{
												left: `${startPercent}%`,
												width: `${width}%`,
											}}
										/>
									)}

									{/* Start marker */}
									{step.videoStartTime !== undefined && (
										<div
											className={`absolute top-1/2 w-3 h-3 rounded-full ${color.bg} ${color.border} border-2 z-10`}
											style={{
												left: `${(step.videoStartTime / videoDuration) * 100}%`,
												transform: "translate(-50%, -50%)",
											}}
										/>
									)}

									{/* End marker */}
									{step.videoEndTime !== undefined && (
										<div
											className={`absolute top-1/2 w-2 h-2 rounded-sm ${color.bg} ${color.border} border z-10`}
											style={{
												left: `${(step.videoEndTime / videoDuration) * 100}%`,
												transform: "translate(-50%, -50%)",
											}}
										/>
									)}

									{/* Current time indicator */}
									<div
										className="absolute top-0 w-0.5 h-full bg-foreground rounded z-20"
										style={{
											left: `${currentTimePercent}%`,
										}}
									/>
								</div>
							</div>

							{/* Instruction and timing inputs */}
							<div className="flex items-start gap-2 pl-8">
								<p className="flex-1 text-sm text-foreground/80 line-clamp-2">
									{step.instruction}
								</p>

								<div className="flex items-center gap-3 shrink-0">
									<div className="flex items-center gap-1">
										<input
											type="number"
											min={0}
											max={videoDuration}
											value={step.videoStartTime ?? 0}
											onChange={(e) =>
												onUpdateTiming(
													i,
													"videoStartTime",
													parseInt(e.target.value) || 0,
												)
											}
											className="w-14 px-2 py-1 text-xs bg-background border border-border rounded text-center"
											onClick={(e) => e.stopPropagation()}
										/>
										<span className="text-xs text-muted-foreground">-</span>
										<input
											type="number"
											min={0}
											max={videoDuration}
											value={step.videoEndTime ?? 0}
											onChange={(e) =>
												onUpdateTiming(
													i,
													"videoEndTime",
													parseInt(e.target.value) || 0,
												)
											}
											className="w-14 px-2 py-1 text-xs bg-background border border-border rounded text-center"
											onClick={(e) => e.stopPropagation()}
										/>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Time labels footer */}
			<div className="px-4 py-2 border-t border-border flex justify-between text-xs text-muted-foreground font-mono pl-12">
				<span>0:00</span>
				<span>{formatTimecode(videoDuration)}</span>
			</div>
		</div>
	);
}
