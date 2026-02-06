// ABOUTME: Test recipe factory helpers
// ABOUTME: Creates recipe test data with sensible defaults

import { testDb } from "./db";
import { recipes } from "@/server/db/schema";
import type { TestUser } from "./auth";

interface RecipeOverrides {
	id?: string;
	sourceUrl?: string;
	sourcePlatform?: "tiktok" | "instagram" | "youtube";
	title?: string;
	description?: string;
	videoUrl?: string;
	videoUrlExpiresAt?: Date;
	imageUrl?: string;
	imageUrlExpiresAt?: Date;
	ingredients?: Array<{
		name: string;
		quantity?: string;
		unit?: string;
		notes?: string;
	}>;
	steps?: Array<{
		order: number;
		instruction: string;
		durationMinutes?: number;
		videoStartTime?: number;
		videoEndTime?: number;
	}>;
	prepTimeMinutes?: number | null;
	cookTimeMinutes?: number | null;
	servings?: number | null;
	createdByUserId?: string;
}

export async function createTestRecipe(
	createdBy: TestUser,
	overrides: RecipeOverrides = {},
) {
	const randomId = Math.random().toString(36).slice(2, 10);

	const [recipe] = await testDb
		.insert(recipes)
		.values({
			sourceUrl:
				overrides.sourceUrl ??
				`https://instagram.com/reel/${randomId}`,
			sourcePlatform: overrides.sourcePlatform ?? "instagram",
			title: overrides.title ?? "Test Recipe",
			description:
				overrides.description ?? "A test recipe description",
			videoUrl: overrides.videoUrl,
			videoUrlExpiresAt: overrides.videoUrlExpiresAt,
			imageUrl: overrides.imageUrl,
			imageUrlExpiresAt: overrides.imageUrlExpiresAt,
			ingredients: overrides.ingredients ?? [
				{ name: "Flour", quantity: "200", unit: "g" },
				{ name: "Sugar", quantity: "100", unit: "g" },
			],
			steps: overrides.steps ?? [
				{ order: 1, instruction: "Mix ingredients" },
				{ order: 2, instruction: "Bake at 180C for 30 minutes" },
			],
			prepTimeMinutes:
				"prepTimeMinutes" in overrides
					? overrides.prepTimeMinutes
					: 10,
			cookTimeMinutes:
				"cookTimeMinutes" in overrides
					? overrides.cookTimeMinutes
					: 30,
			servings:
				"servings" in overrides ? overrides.servings : 4,
			createdByUserId:
				overrides.createdByUserId ?? createdBy.id,
		})
		.returning();

	return recipe!;
}
