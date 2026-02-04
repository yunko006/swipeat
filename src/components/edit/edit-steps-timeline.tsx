// ABOUTME: Unified steps and timeline component for timing editor
// ABOUTME: Each step row integrates its timeline bar, instruction, and timing controls

"use client";

import { useState } from "react";
import { Play, Pause, Pin, ChevronLeft, ChevronRight, List } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Step, getStepColor, formatTimecode } from "./types";

interface EditStepsTimelineProps {
	steps: Step[];
	selectedStep: number;
	currentTime: number;
	videoDuration: number;
	isPlaying: boolean;
	className?: string;
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
	className,
	onSelectStep,
	onSeek,
	onUpdateTiming,
	onSetCurrentTimeAsStart,
	onSetCurrentTimeAsEnd,
	onTogglePlayPause,
}: EditStepsTimelineProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [dragOffset, setDragOffset] = useState(0);
	const [stepsPopoverOpen, setStepsPopoverOpen] = useState(false);

	const currentTimePercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

	const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		onSeek(percent * videoDuration);
	};

	const goToStep = (stepIndex: number) => {
		if (stepIndex >= 0 && stepIndex < steps.length) {
			onSelectStep(stepIndex);
			const step = steps[stepIndex];
			if (step?.videoStartTime !== undefined) {
				onSeek(step.videoStartTime);
			}
		}
	};

	const goToPrevStep = () => goToStep(selectedStep - 1);
	const goToNextStep = () => goToStep(selectedStep + 1);

	const handleTouchStart = (e: React.TouchEvent) => {
		setIsDragging(true);
		setStartX(e.touches[0]?.clientX ?? 0);
		setDragOffset(0);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) return;
		setDragOffset((e.touches[0]?.clientX ?? 0) - startX);
	};

	const handleTouchEnd = () => {
		if (!isDragging) return;
		setIsDragging(false);

		const threshold = 50;
		if (dragOffset > threshold) {
			goToPrevStep();
		} else if (dragOffset < -threshold) {
			goToNextStep();
		}

		setDragOffset(0);
	};

	const currentStepData = steps[selectedStep];
	const currentColor = getStepColor(selectedStep);

	return (
		<div className={className}>
			{/* Desktop view */}
			<div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden">
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
							title="Cliquer pour définir le début de l'étape à la position actuelle"
							className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
						>
							<Pin className="w-3.5 h-3.5" />
							Définir début ({formatTimecode(currentTime)})
						</button>
						<button
							onClick={onSetCurrentTimeAsEnd}
							title="Cliquer pour définir la fin de l'étape à la position actuelle"
							className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
						>
							<Pin className="w-3.5 h-3.5" />
							Définir fin ({formatTimecode(currentTime)})
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
										className={`flex-1 bg-foreground/10 rounded cursor-pointer relative transition-all duration-200 ${
											isSelected ? "h-10" : "h-5"
										}`}
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
												className={`absolute top-1/2 rounded-full ${color.bg} ${color.border} border-2 z-10 transition-all duration-200 ${
													isSelected ? "w-4 h-4" : "w-3 h-3"
												}`}
												style={{
													left: `${(step.videoStartTime / videoDuration) * 100}%`,
													transform: "translate(-50%, -50%)",
												}}
											/>
										)}

										{/* End marker */}
										{step.videoEndTime !== undefined && (
											<div
												className={`absolute top-1/2 rounded-sm ${color.bg} ${color.border} border z-10 transition-all duration-200 ${
													isSelected ? "w-3 h-3" : "w-2 h-2"
												}`}
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

			{/* Mobile view */}
			<div className="lg:hidden bg-card border border-border rounded-xl overflow-hidden">
				{/* Action bar */}
				<div className="p-3 border-b border-border flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							onClick={onTogglePlayPause}
							className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center"
						>
							{isPlaying ? (
								<Pause className="w-4 h-4 text-foreground" />
							) : (
								<Play className="w-4 h-4 text-foreground ml-0.5" />
							)}
						</button>
						<span className="font-mono text-sm">
							{formatTimecode(currentTime)}
						</span>
					</div>

					<div className="flex gap-2">
						<button
							onClick={onSetCurrentTimeAsStart}
							className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
						>
							<Pin className="w-3 h-3" />
							Début
						</button>
						<button
							onClick={onSetCurrentTimeAsEnd}
							className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
						>
							<Pin className="w-3 h-3" />
							Fin
						</button>
					</div>
				</div>

				{/* Swipeable step area */}
				{currentStepData && (
					<div
						className="p-4 touch-pan-x select-none"
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						style={{
							transform: `translateX(${dragOffset}px)`,
							transition: isDragging ? "none" : "transform 0.2s ease-out",
						}}
					>
						{/* Step badge + menu button */}
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<div
									className={`w-6 h-6 rounded-full ${currentColor.bg} flex items-center justify-center text-white text-xs font-bold`}
								>
									{selectedStep}
								</div>
								<span className="text-xs text-muted-foreground">
									Étape {selectedStep + 1}/{steps.length}
								</span>
							</div>
							<Popover open={stepsPopoverOpen} onOpenChange={setStepsPopoverOpen}>
								<PopoverTrigger asChild>
									<button className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
										<List className="w-4 h-4" />
									</button>
								</PopoverTrigger>
								<PopoverContent
									align="end"
									className="w-72 p-0 max-h-64 overflow-y-auto"
								>
									<div className="p-2 border-b border-border">
										<span className="text-xs font-medium text-muted-foreground">
											Toutes les étapes
										</span>
									</div>
									{steps.map((step, i) => {
										const color = getStepColor(i);
										const isStepSelected = i === selectedStep;
										return (
											<button
												key={i}
												onClick={() => {
													goToStep(i);
													setStepsPopoverOpen(false);
												}}
												className={`w-full p-3 flex items-start gap-3 text-left transition-colors ${
													isStepSelected
														? "bg-foreground/10"
														: "hover:bg-foreground/5"
												}`}
											>
												<div
													className={`w-5 h-5 rounded-full ${color.bg} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}
												>
													{i}
												</div>
												<p className="text-sm text-foreground/80 line-clamp-2">
													{step.instruction}
												</p>
											</button>
										);
									})}
								</PopoverContent>
							</Popover>
						</div>

						{/* Instruction */}
						<p className="text-sm text-foreground/80 mb-4">
							{currentStepData.instruction}
						</p>

						{/* Compact timing inputs */}
						<div className="flex items-center gap-2 mb-4">
							<input
								type="number"
								min={0}
								max={videoDuration}
								value={currentStepData.videoStartTime ?? 0}
								onChange={(e) =>
									onUpdateTiming(
										selectedStep,
										"videoStartTime",
										parseInt(e.target.value) || 0,
									)
								}
								className="w-14 px-2 py-1 text-xs bg-background border border-border rounded text-center"
							/>
							<span className="text-xs text-muted-foreground">-</span>
							<input
								type="number"
								min={0}
								max={videoDuration}
								value={currentStepData.videoEndTime ?? 0}
								onChange={(e) =>
									onUpdateTiming(
										selectedStep,
										"videoEndTime",
										parseInt(e.target.value) || 0,
									)
								}
								className="w-14 px-2 py-1 text-xs bg-background border border-border rounded text-center"
							/>
							<span className="text-xs text-muted-foreground">sec</span>
						</div>

						{/* Timeline bar */}
						{(() => {
							const hasTimings =
								currentStepData.videoStartTime !== undefined &&
								currentStepData.videoEndTime !== undefined;
							const startPercent = hasTimings
								? (currentStepData.videoStartTime! / videoDuration) * 100
								: 0;
							const endPercent = hasTimings
								? (currentStepData.videoEndTime! / videoDuration) * 100
								: 0;
							const width = endPercent - startPercent;

							return (
								<div
									className="h-8 bg-foreground/10 rounded cursor-pointer relative"
									onClick={(e) => {
										e.stopPropagation();
										handleTimelineClick(e);
									}}
								>
									{/* Step range */}
									{hasTimings && (
										<div
											className={`absolute top-0 h-full ${currentColor.range} rounded`}
											style={{
												left: `${startPercent}%`,
												width: `${width}%`,
											}}
										/>
									)}

									{/* Start marker */}
									{currentStepData.videoStartTime !== undefined && (
										<div
											className={`absolute top-1/2 w-3 h-3 rounded-full ${currentColor.bg} ${currentColor.border} border-2 z-10`}
											style={{
												left: `${(currentStepData.videoStartTime / videoDuration) * 100}%`,
												transform: "translate(-50%, -50%)",
											}}
										/>
									)}

									{/* End marker */}
									{currentStepData.videoEndTime !== undefined && (
										<div
											className={`absolute top-1/2 w-2.5 h-2.5 rounded-sm ${currentColor.bg} ${currentColor.border} border z-10`}
											style={{
												left: `${(currentStepData.videoEndTime / videoDuration) * 100}%`,
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
							);
						})()}

						{/* Time labels */}
						<div className="flex justify-between text-xs text-muted-foreground font-mono mt-1">
							<span>0:00</span>
							<span>{formatTimecode(videoDuration)}</span>
						</div>
					</div>
				)}

				{/* Navigation: chevrons + dots */}
				<div className="flex items-center justify-between p-3 border-t border-border">
					<button
						onClick={goToPrevStep}
						disabled={selectedStep === 0}
						className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center disabled:opacity-30"
					>
						<ChevronLeft className="w-4 h-4" />
					</button>

					<div className="flex gap-1.5">
						{steps.map((_, i) => (
							<button
								key={i}
								onClick={() => goToStep(i)}
								className={`w-2 h-2 rounded-full transition-colors ${
									i === selectedStep ? "bg-foreground" : "bg-foreground/30"
								}`}
							/>
						))}
					</div>

					<button
						onClick={goToNextStep}
						disabled={selectedStep === steps.length - 1}
						className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center disabled:opacity-30"
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
