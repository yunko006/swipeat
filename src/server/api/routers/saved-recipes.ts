// ABOUTME: Saved recipes tRPC router
// ABOUTME: Handles user recipe bookmarking (save/unsave/check)

import { z } from "zod";
import { createTRPCRouter, subscribedProcedure } from "@/server/api/trpc";
import { userSavedRecipes } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const savedRecipesRouter = createTRPCRouter({
	toggle: subscribedProcedure
		.input(z.object({ recipeId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.userSavedRecipes.findFirst({
				where: and(
					eq(userSavedRecipes.userId, ctx.session.user.id),
					eq(userSavedRecipes.recipeId, input.recipeId),
				),
			});

			if (existing) {
				// Unsave
				await ctx.db
					.delete(userSavedRecipes)
					.where(eq(userSavedRecipes.id, existing.id));

				return { saved: false };
			} else {
				// Save
				await ctx.db.insert(userSavedRecipes).values({
					userId: ctx.session.user.id,
					recipeId: input.recipeId,
				});

				return { saved: true };
			}
		}),

	isSaved: subscribedProcedure
		.input(z.object({ recipeId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const saved = await ctx.db.query.userSavedRecipes.findFirst({
				where: and(
					eq(userSavedRecipes.userId, ctx.session.user.id),
					eq(userSavedRecipes.recipeId, input.recipeId),
				),
			});

			return { saved: !!saved };
		}),

	getUserSavedRecipes: subscribedProcedure.query(async ({ ctx }) => {
		const savedRecipes = await ctx.db.query.userSavedRecipes.findMany({
			where: eq(userSavedRecipes.userId, ctx.session.user.id),
			with: {
				recipe: true,
			},
			orderBy: (userSavedRecipes, { desc }) => [
				desc(userSavedRecipes.savedAt),
			],
		});

		return savedRecipes.map((sr) => sr.recipe);
	}),
});
