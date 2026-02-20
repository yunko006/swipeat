// ABOUTME: Integration tests for saved-recipes tRPC router
// ABOUTME: Tests bookmark toggle, check, and listing against real DB

import { describe, it, expect } from "vitest";
import { createTestRecipe } from "@/test/helpers/recipes";
import {
	createUnauthenticatedCaller,
	createSubscribedCaller,
} from "@/test/helpers/trpc";

describe("savedRecipes.toggle", () => {
	it("saves a recipe on first toggle", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const recipe = await createTestRecipe(testUser);

		const result = await caller.savedRecipes.toggle({
			recipeId: recipe.id,
		});

		expect(result.saved).toBe(true);
	});

	it("unsaves a previously saved recipe on second toggle", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const recipe = await createTestRecipe(testUser);

		await caller.savedRecipes.toggle({ recipeId: recipe.id });
		const result = await caller.savedRecipes.toggle({
			recipeId: recipe.id,
		});

		expect(result.saved).toBe(false);
	});

	it("requires authentication", async () => {
		const caller = createUnauthenticatedCaller();

		await expect(
			caller.savedRecipes.toggle({
				recipeId: "00000000-0000-0000-0000-000000000000",
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});
});

describe("savedRecipes.isSaved", () => {
	it("returns true for saved recipe", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const recipe = await createTestRecipe(testUser);

		await caller.savedRecipes.toggle({ recipeId: recipe.id });
		const result = await caller.savedRecipes.isSaved({
			recipeId: recipe.id,
		});

		expect(result.saved).toBe(true);
	});

	it("returns false for unsaved recipe", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const recipe = await createTestRecipe(testUser);

		const result = await caller.savedRecipes.isSaved({
			recipeId: recipe.id,
		});

		expect(result.saved).toBe(false);
	});
});

describe("savedRecipes.getUserSavedRecipes", () => {
	it("returns saved recipes with recipe data", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const recipe = await createTestRecipe(testUser, {
			title: "Saved Recipe",
		});

		await caller.savedRecipes.toggle({ recipeId: recipe.id });
		const recipes = await caller.savedRecipes.getUserSavedRecipes();

		expect(recipes).toHaveLength(1);
		expect(recipes[0]!.title).toBe("Saved Recipe");
	});

	it("returns empty array when no saved recipes", async () => {
		const { caller } = await createSubscribedCaller();

		const recipes = await caller.savedRecipes.getUserSavedRecipes();

		expect(recipes).toEqual([]);
	});

	it("only returns recipes saved by the requesting user", async () => {
		const { caller: caller1, testUser: user1 } = await createSubscribedCaller();
		const { caller: caller2 } = await createSubscribedCaller();
		const recipe = await createTestRecipe(user1, {
			title: "User1 Saved",
		});

		await caller1.savedRecipes.toggle({ recipeId: recipe.id });

		const recipes = await caller2.savedRecipes.getUserSavedRecipes();

		expect(recipes).toEqual([]);
	});
});
