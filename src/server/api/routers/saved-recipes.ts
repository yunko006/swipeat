// ABOUTME: Saved recipes tRPC router
// ABOUTME: Handles user recipe bookmarking (save/unsave/check)

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userSavedRecipes } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const savedRecipesRouter = createTRPCRouter({
	toggle: protectedProcedure
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

	isSaved: protectedProcedure
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
});
