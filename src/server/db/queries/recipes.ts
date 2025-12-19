// ABOUTME: Recipe database queries
// ABOUTME: Helper functions for recipe-related database operations

import { eq } from "drizzle-orm";
import { db } from "..";
import { recipes } from "../schema";

export async function getRecipeBySourceUrl(sourceUrl: string) {
	return await db.query.recipes.findFirst({
		where: eq(recipes.sourceUrl, sourceUrl),
	});
}
