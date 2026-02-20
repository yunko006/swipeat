// ABOUTME: Explore tRPC router
// ABOUTME: Handles recipe browsing, filtering, and pagination

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { recipes } from "@/server/db/schema";
import { desc, asc, ilike, or, sql } from "drizzle-orm";

export const exploreRouter = createTRPCRouter({
	list: publicProcedure
		.input(
			z.object({
				search: z.string().optional(),
				category: z.string().optional(),
				sortBy: z.enum(["trending", "recent", "quick"]).default("recent"),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [];

			if (input.search) {
				conditions.push(
					or(
						ilike(recipes.title, `%${input.search}%`),
						ilike(recipes.description, `%${input.search}%`),
					),
				);
			}

			let orderByClause;
			switch (input.sortBy) {
				case "trending":
					// For now, use creation date; later add likes count
					orderByClause = desc(recipes.createdAt);
					break;
				case "recent":
					orderByClause = desc(recipes.createdAt);
					break;
				case "quick":
					orderByClause = asc(
						sql`COALESCE(${recipes.prepTimeMinutes}, 999999)`,
					);
					break;
				default:
					orderByClause = desc(recipes.createdAt);
			}

			const items = await ctx.db.query.recipes.findMany({
				where: conditions.length > 0 ? conditions[0] : undefined,
				orderBy: orderByClause,
				limit: input.limit,
				offset: input.offset,
				with: {
					createdBy: {
						columns: {
							name: true,
							image: true,
						},
					},
				},
			});

			// Get total count for pagination
			const totalCount = await ctx.db
				.select({ count: sql<number>`count(*)` })
				.from(recipes)
				.where(conditions.length > 0 ? conditions[0] : undefined);

			return {
				items,
				total: Number(totalCount[0]?.count ?? 0),
				hasMore: input.offset + input.limit < Number(totalCount[0]?.count ?? 0),
			};
		}),
});
