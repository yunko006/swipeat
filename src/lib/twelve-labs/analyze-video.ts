// ABOUTME: Video analysis for recipe step timestamps
// ABOUTME: Uses Twelve Labs to identify when each cooking step occurs in the video

import { twelveLabsClient } from "./client";
import type { RecipeExtraction } from "@/lib/ai/schemas";
import { uploadVideoToTwelveLabs } from "./upload-video";
import { buildPrompt, type TwelveLabsPromptType } from "./prompts";

interface StepTimestamp {
	step: number;
	startSeconds: number | null;
	endSeconds: number | null;
	confidence?: number;
}

export async function analyzeRecipeVideo(
	videoUrl: string,
	extractedRecipe: RecipeExtraction,
	promptType: TwelveLabsPromptType = "basic",
): Promise<StepTimestamp[]> {
	// Upload video to Twelve Labs and get videoId
	const videoId = await uploadVideoToTwelveLabs(videoUrl);

	// Build the prompt from extracted recipe steps
	const steps = extractedRecipe.steps.map((step) => step.instruction);
	const fullPrompt = buildPrompt(promptType, steps);

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
	// Twelve Labs may return JSON wrapped in markdown code blocks or with extra text
	try {
		let jsonString = result.data;

		// Try to extract JSON array from the response if it's wrapped in text
		const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			jsonString = jsonMatch[0];
		}

		const timestamps: StepTimestamp[] = JSON.parse(jsonString);
		return timestamps;
	} catch (error) {
		console.error("Failed to parse Twelve Labs response:", result.data);
		throw new Error("Failed to parse video analysis response");
	}
}
