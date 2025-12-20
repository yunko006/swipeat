// ABOUTME: Recipe extraction using AI
// ABOUTME: Main function to extract structured recipe data from descriptions

import { generateObject } from "ai";
import { defaultRecipeExtractionModel } from "./providers";
import { recipeExtractionSchema } from "./schemas";
import { buildRecipeExtractionPrompt } from "./prompts/recipe-extraction";
import type { RecipeExtraction } from "./schemas";

export async function extractRecipeFromDescription(
	description: string,
): Promise<RecipeExtraction> {
	const result = await generateObject({
		model: defaultRecipeExtractionModel,
		schema: recipeExtractionSchema,
		prompt: buildRecipeExtractionPrompt(description),
	});

	return result.object;
}
