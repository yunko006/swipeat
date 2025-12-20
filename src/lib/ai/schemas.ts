// ABOUTME: AI response schemas
// ABOUTME: Zod schemas for structured AI outputs

import { z } from "zod";

export const ingredientSchema = z.object({
	name: z.string().describe("Nom de l'ingrédient"),
	quantity: z.string().optional().describe("Quantité (ex: '200', '2')"),
	unit: z
		.string()
		.optional()
		.describe("Unité de mesure (ex: 'g', 'ml', 'cuillères')"),
	notes: z.string().optional().describe("Notes additionnelles"),
});

export const recipeStepSchema = z.object({
	order: z.number().describe("Ordre de l'étape (commence à 1)"),
	instruction: z.string().describe("Instruction claire et concise"),
	durationMinutes: z
		.number()
		.optional()
		.describe("Durée estimée de l'étape en minutes"),
});

export const recipeExtractionSchema = z.object({
	ingredients: z
		.array(ingredientSchema)
		.describe("Liste complète des ingrédients de la recette"),
	steps: z
		.array(recipeStepSchema)
		.describe("Étapes de la recette dans l'ordre"),
	prepTimeMinutes: z
		.number()
		.optional()
		.describe("Temps de préparation total en minutes"),
	cookTimeMinutes: z
		.number()
		.optional()
		.describe("Temps de cuisson total en minutes"),
	servings: z
		.number()
		.optional()
		.describe("Nombre de portions que cette recette produit"),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type RecipeStep = z.infer<typeof recipeStepSchema>;
export type RecipeExtraction = z.infer<typeof recipeExtractionSchema>;
