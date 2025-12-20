// ABOUTME: Video analysis for recipe step timestamps
// ABOUTME: Uses Twelve Labs to identify when each cooking step occurs in the video

import { twelveLabsClient } from "./client";
import type { RecipeExtraction } from "@/lib/ai/schemas";
import { uploadVideoToTwelveLabs } from "./upload-video";

interface StepTimestamp {
	step: number;
	startSeconds: number;
	endSeconds: number;
}

export async function analyzeRecipeVideo(
	videoUrl: string,
	extractedRecipe: RecipeExtraction,
): Promise<StepTimestamp[]> {
	// Upload video to Twelve Labs and get videoId
	const videoId = await uploadVideoToTwelveLabs(videoUrl);

	// Build the prompt from extracted recipe steps
	const stepsPrompt = extractedRecipe.steps
		.map((step, index) => `${index + 1}. ${step.instruction}`)
		.join("\n");

	const fullPrompt = `Identify the start time and end time (in seconds) for each cooking step in this video:

${stepsPrompt}

Return as JSON: [{ "step": 1, "startSeconds": X, "endSeconds": Y }, ...]`;

	// Use Twelve Labs Analyze API
	const result = await twelveLabsClient.analyze({
		videoId,
		prompt: fullPrompt,
		temperature: 0.2,
	});

	console.log("Twelve Labs response:", result);

	// Check if we have data
	if (!result.data) {
		throw new Error("No data returned from Twelve Labs");
	}

	// Parse the JSON response from result.data
	try {
		const timestamps: StepTimestamp[] = JSON.parse(result.data);
		return timestamps;
	} catch (error) {
		console.error("Failed to parse Twelve Labs response:", result.data);
		throw new Error("Failed to parse video analysis response");
	}
}
