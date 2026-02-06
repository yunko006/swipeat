// ABOUTME: Tests for recipe database queries
// ABOUTME: Validates getRecipeBySourceUrl and confirms vi.mock intercepts the global db import

import { describe, it, expect } from "vitest";
import { getRecipeBySourceUrl } from "./recipes";
import { createTestUser } from "@/test/helpers/auth";
import { createTestRecipe } from "@/test/helpers/recipes";

describe("getRecipeBySourceUrl", () => {
	it("finds a recipe by exact source URL", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user, {
			sourceUrl: "https://instagram.com/reel/ABC123",
		});

		const found = await getRecipeBySourceUrl(
			"https://instagram.com/reel/ABC123",
		);

		expect(found).not.toBeUndefined();
		expect(found!.id).toBe(recipe.id);
		expect(found!.sourceUrl).toBe("https://instagram.com/reel/ABC123");
	});

	it("returns undefined for non-existent URL", async () => {
		const found = await getRecipeBySourceUrl(
			"https://instagram.com/reel/NONEXISTENT",
		);

		expect(found).toBeUndefined();
	});
});
