// ABOUTME: Recipe tRPC router
// ABOUTME: Handles recipe CRUD operations

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { recipes } from "@/server/db/schema";
import { getRecipeBySourceUrl } from "@/server/db/queries/recipes";
import { extractRecipeFromDescription } from "@/lib/ai/extract-recipe";
import { analyzeRecipeVideo } from "@/lib/twelve-labs/analyze-video";

const saveRecipeInput = z.object({
	sourceUrl: z.string().url(),
	sourcePlatform: z.enum(["tiktok", "instagram", "youtube"]),
	title: z.string().min(1),
	description: z.string().optional(),
	imageUrl: z.string().url().optional(),
	imageUrlExpiresAt: z.date().optional(),
	videoUrl: z.string().url().optional(),
	videoUrlExpiresAt: z.date().optional(),
});

export const recipeRouter = createTRPCRouter({
	save: protectedProcedure
		.input(saveRecipeInput)
		.mutation(async ({ ctx, input }) => {
			const existingRecipe = await getRecipeBySourceUrl(input.sourceUrl);

			if (existingRecipe) {
				return {
					success: true,
					recipeId: existingRecipe.id,
					isNew: false,
				};
			}

			const [newRecipe] = await ctx.db
				.insert(recipes)
				.values({
					sourceUrl: input.sourceUrl,
					sourcePlatform: input.sourcePlatform,
					videoUrl: input.videoUrl,
					videoUrlExpiresAt: input.videoUrlExpiresAt,
					title: input.title,
					description: input.description,
					imageUrl: input.imageUrl,
					imageUrlExpiresAt: input.imageUrlExpiresAt,
					ingredients: [],
					steps: [],
					createdByUserId: ctx.session.user.id,
				})
				.returning();

			return {
				success: true,
				recipeId: newRecipe!.id,
				isNew: true,
			};
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const recipe = await ctx.db.query.recipes.findFirst({
				where: (recipes, { eq }) => eq(recipes.id, input.id),
			});

			return recipe ?? null;
		}),

	getBySourceUrl: protectedProcedure
		.input(z.object({ sourceUrl: z.string().url() }))
		.query(async ({ input }) => {
			return await getRecipeBySourceUrl(input.sourceUrl);
		}),

	extractAndSave: protectedProcedure
		.input(
			z.object({
				sourceUrl: z.string().url(),
				sourcePlatform: z.enum(["tiktok", "instagram", "youtube"]),
				description: z.string().min(1),
				imageUrl: z.string().url().optional(),
				imageUrlExpiresAt: z.date().optional(),
				videoUrl: z.string().url().optional(),
				videoUrlExpiresAt: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existingRecipe = await getRecipeBySourceUrl(input.sourceUrl);

			if (existingRecipe) {
				return {
					success: true,
					recipeId: existingRecipe.id,
					isNew: false,
					extracted: {
						ingredients: existingRecipe.ingredients,
						steps: existingRecipe.steps,
						prepTimeMinutes: existingRecipe.prepTimeMinutes,
						cookTimeMinutes: existingRecipe.cookTimeMinutes,
						servings: existingRecipe.servings,
					},
				};
			}

			const extracted = await extractRecipeFromDescription(input.description);

			// Analyze video to get step timestamps using videoUrl
			let stepsWithTimestamps = extracted.steps;
			if (input.videoUrl) {
				try {
					const timestamps = await analyzeRecipeVideo(
						input.videoUrl,
						extracted,
					);

					// Merge timestamps into steps
					stepsWithTimestamps = extracted.steps.map((step) => {
						const timestamp = timestamps.find((t) => t.step === step.order);
						return {
							...step,
							videoStartTime: timestamp?.startSeconds,
							videoEndTime: timestamp?.endSeconds,
						};
					});
				} catch (error) {
					console.error("Failed to analyze video with Twelve Labs:", error);
					// Continue without timestamps if analysis fails
				}
			}

			const title = input.description.split("\n")[0] || "Sans titre";

			const [newRecipe] = await ctx.db
				.insert(recipes)
				.values({
					sourceUrl: input.sourceUrl,
					sourcePlatform: input.sourcePlatform,
					videoUrl: input.videoUrl,
					videoUrlExpiresAt: input.videoUrlExpiresAt,
					title: title.substring(0, 200),
					description: input.description,
					imageUrl: input.imageUrl,
					imageUrlExpiresAt: input.imageUrlExpiresAt,
					ingredients: extracted.ingredients,
					steps: stepsWithTimestamps,
					prepTimeMinutes: extracted.prepTimeMinutes,
					cookTimeMinutes: extracted.cookTimeMinutes,
					servings: extracted.servings,
					extractionModel: "claude-3-5-sonnet-20241022",
					createdByUserId: ctx.session.user.id,
				})
				.returning();

			return {
				success: true,
				recipeId: newRecipe!.id,
				isNew: true,
				extracted: {
					...extracted,
					steps: stepsWithTimestamps,
				},
			};
		}),

	getUserImportedRecipes: protectedProcedure.query(async ({ ctx }) => {
		const importedRecipes = await ctx.db.query.recipes.findMany({
			where: (recipes, { eq }) => eq(recipes.createdByUserId, ctx.session.user.id),
			orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
		});

		return importedRecipes;
	}),
});
