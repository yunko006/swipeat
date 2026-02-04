// ABOUTME: Recipe timing editor page
// ABOUTME: Allows recipe owners to correct video timestamps for each step

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RotateCcw, RefreshCw, ChevronDown } from "lucide-react";
import { api } from "@/trpc/react";
import {
	EditVideoPlayer,
	EditStepsTimeline,
	CompareTimingsModal,
	type Step,
} from "@/components/edit";
import { AnalysisProgressModal } from "@/components/analysis-progress-modal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	TWELVE_LABS_PROMPT_OPTIONS,
	type TwelveLabsPromptType,
} from "@/lib/twelve-labs/prompts";

export default function EditRecipePage() {
	const params = useParams();
	const router = useRouter();
	const recipeId = params.id as string;

	const utils = api.useUtils();

	const { data: recipe, isLoading } = api.recipe.getById.useQuery({
		id: recipeId,
	});

	const updateTimings = api.recipe.updateStepTimings.useMutation({
		onSuccess: async () => {
			await utils.recipe.getById.invalidate({ id: recipeId });
			router.push(`/recette/${recipeId}`);
		},
	});

	const reanalyzeTimings = api.recipe.reanalyzeTimings.useMutation();

	const [steps, setSteps] = useState<Step[]>([]);
	const [showCompareModal, setShowCompareModal] = useState(false);
	const [showAnalysisModal, setShowAnalysisModal] = useState(false);
	const [analysisError, setAnalysisError] = useState<string | null>(null);
	const [newTimings, setNewTimings] = useState<Step[] | null>(null);
	const [selectedStep, setSelectedStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [videoDuration, setVideoDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (recipe?.steps) {
			setSteps(recipe.steps);
		}
	}, [recipe]);

	const handleTimeUpdate = useCallback(() => {
		if (videoRef.current) {
			setCurrentTime(videoRef.current.currentTime);
		}
	}, []);

	const handleLoadedMetadata = useCallback(() => {
		if (videoRef.current) {
			setVideoDuration(videoRef.current.duration);
		}
	}, []);

	const seekTo = useCallback((time: number) => {
		if (videoRef.current) {
			videoRef.current.currentTime = time;
			setCurrentTime(time);
		}
	}, []);

	const togglePlayPause = useCallback(() => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	}, [isPlaying]);

	const updateStepTiming = useCallback(
		(stepIndex: number, field: "videoStartTime" | "videoEndTime", value: number) => {
			setSteps((prev) =>
				prev.map((step, i) => (i === stepIndex ? { ...step, [field]: value } : step)),
			);
		},
		[],
	);

	const setCurrentTimeAsStart = useCallback(() => {
		updateStepTiming(selectedStep, "videoStartTime", Math.floor(currentTime));
	}, [selectedStep, currentTime, updateStepTiming]);

	const setCurrentTimeAsEnd = useCallback(() => {
		updateStepTiming(selectedStep, "videoEndTime", Math.floor(currentTime));
	}, [selectedStep, currentTime, updateStepTiming]);

	const resetToOriginal = useCallback(() => {
		if (recipe?.originalSteps) {
			// Deep copy to avoid reference issues
			setSteps(JSON.parse(JSON.stringify(recipe.originalSteps)));
		}
	}, [recipe?.originalSteps]);

	const hasOriginalSteps = !!recipe?.originalSteps;

	const handleReanalyze = async (promptType: TwelveLabsPromptType) => {
		setShowAnalysisModal(true);
		setAnalysisError(null);

		try {
			const result = await reanalyzeTimings.mutateAsync({
				recipeId,
				promptType,
			});

			setShowAnalysisModal(false);

			if (result.newSteps) {
				setNewTimings(result.newSteps as Step[]);
				setShowCompareModal(true);
			}
		} catch (error) {
			setAnalysisError(
				error instanceof Error ? error.message : "Une erreur est survenue",
			);
		}
	};

	const applyNewTimings = () => {
		if (newTimings) {
			setSteps(newTimings);
			setShowCompareModal(false);
			setNewTimings(null);
		}
	};

	const cancelNewTimings = () => {
		setShowCompareModal(false);
		setNewTimings(null);
	};

	const handleSave = () => {
		updateTimings.mutate({
			recipeId,
			steps,
		});
	};

	if (isLoading) {
		return (
			<main className="min-h-screen bg-background theme-vercel-dark py-8">
				<div className="max-w-7xl mx-auto px-4">
					<p className="text-muted-foreground">Chargement...</p>
				</div>
			</main>
		);
	}

	if (!recipe) {
		return (
			<main className="min-h-screen bg-background theme-vercel-dark py-8">
				<div className="max-w-7xl mx-auto px-4">
					<p className="text-muted-foreground">Recette non trouvee</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background theme-vercel-dark py-4 lg:py-8">
			<div className="max-w-7xl mx-auto px-2 lg:px-4 pt-8 lg:pt-12">
				{/* Header */}
				<div className="flex items-center justify-between mb-4 lg:mb-8">
					<Link
						href={`/recette/${recipeId}`}
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="hidden sm:inline">Retour</span>
					</Link>
					<div className="flex items-center gap-2">
						{/* Desktop-only buttons */}
						<div className="hidden lg:flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										disabled={reanalyzeTimings.isPending}
										className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
									>
										<RefreshCw className={`w-4 h-4 ${reanalyzeTimings.isPending ? "animate-spin" : ""}`} />
										{reanalyzeTimings.isPending ? "Analyse..." : "Re-analyser"}
										<ChevronDown className="w-4 h-4" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{TWELVE_LABS_PROMPT_OPTIONS.filter((opt) => !opt.disabled).map((option) => (
										<DropdownMenuItem
											key={option.value}
											onClick={() => handleReanalyze(option.value)}
										>
											<div className="flex flex-col">
												<span className="font-medium">{option.label}</span>
												<span className="text-xs text-muted-foreground">
													{option.description}
												</span>
											</div>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
							{hasOriginalSteps && (
								<button
									onClick={resetToOriginal}
									className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
								>
									<RotateCcw className="w-4 h-4" />
									Reset aux originaux
								</button>
							)}
						</div>
						{/* Save button - always visible */}
						<button
							onClick={handleSave}
							disabled={updateTimings.isPending}
							className="inline-flex items-center gap-2 px-3 py-2 lg:px-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
						>
							<Save className="w-4 h-4" />
							<span className="hidden sm:inline">
								{updateTimings.isPending ? "Sauvegarde..." : "Sauvegarder"}
							</span>
						</button>
					</div>
				</div>

				<h1 className="hidden lg:block text-2xl font-bold mb-6">Editer les timings</h1>

				{/* Two-column layout - video first on mobile */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
					{/* Steps and timeline - order-2 on mobile, order-1 on desktop */}
					<EditStepsTimeline
						steps={steps}
						selectedStep={selectedStep}
						currentTime={currentTime}
						videoDuration={videoDuration}
						isPlaying={isPlaying}
						onSelectStep={setSelectedStep}
						onSeek={seekTo}
						onUpdateTiming={updateStepTiming}
						onSetCurrentTimeAsStart={setCurrentTimeAsStart}
						onSetCurrentTimeAsEnd={setCurrentTimeAsEnd}
						onTogglePlayPause={togglePlayPause}
						className="order-2 lg:order-1"
					/>

					{/* Video player - order-1 on mobile (first), order-2 on desktop */}
					<div className="order-1 lg:order-2 lg:sticky lg:top-8 lg:self-start">
						<EditVideoPlayer
							ref={videoRef}
							videoUrl={recipe.videoUrl ?? undefined}
							isPlaying={isPlaying}
							onTogglePlayPause={togglePlayPause}
							onTimeUpdate={handleTimeUpdate}
							onLoadedMetadata={handleLoadedMetadata}
							onPlay={() => setIsPlaying(true)}
							onPause={() => setIsPlaying(false)}
						/>
					</div>
				</div>
			</div>

			{showCompareModal && newTimings && (
				<CompareTimingsModal
					currentSteps={steps}
					newSteps={newTimings}
					onApply={applyNewTimings}
					onCancel={cancelNewTimings}
				/>
			)}

			<AnalysisProgressModal
				isOpen={showAnalysisModal}
				isComplete={!reanalyzeTimings.isPending && showAnalysisModal && !analysisError}
				error={analysisError}
			/>
		</main>
	);
}
