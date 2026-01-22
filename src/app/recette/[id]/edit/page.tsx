// ABOUTME: Recipe timing editor page
// ABOUTME: Allows recipe owners to correct video timestamps for each step

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { api } from "@/trpc/react";
import {
	EditVideoPlayer,
	EditStepsTimeline,
	type Step,
} from "@/components/edit";

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

	const [steps, setSteps] = useState<Step[]>([]);
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
		<main className="min-h-screen bg-background theme-vercel-dark py-8">
			<div className="max-w-7xl mx-auto px-4 pt-12">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<Link
						href={`/recette/${recipeId}`}
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Retour
					</Link>
					<div className="flex items-center gap-2">
						{hasOriginalSteps && (
							<button
								onClick={resetToOriginal}
								className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
							>
								<RotateCcw className="w-4 h-4" />
								Reset aux originaux
							</button>
						)}
						<button
							onClick={handleSave}
							disabled={updateTimings.isPending}
							className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
						>
							<Save className="w-4 h-4" />
							{updateTimings.isPending ? "Sauvegarde..." : "Sauvegarder"}
						</button>
					</div>
				</div>

				<h1 className="text-2xl font-bold mb-6">Editer les timings</h1>

				{/* Two-column layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left column - Unified steps and timeline */}
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
					/>

					{/* Right column - Video player */}
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
		</main>
	);
}
