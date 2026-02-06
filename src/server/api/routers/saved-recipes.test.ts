// ABOUTME: Integration tests for saved-recipes tRPC router
// ABOUTME: Tests bookmark toggle, check, and listing against real DB

import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { createTestUser } from "@/test/helpers/auth";
import { createTestRecipe } from "@/test/helpers/recipes";
import {
	createAuthenticatedCaller,
	createUnauthenticatedCaller,
} from "@/test/helpers/trpc";

describe("savedRecipes.toggle", () => {
	it("saves a recipe on first toggle", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user);
		const caller = createAuthenticatedCaller(user);

		const result = await caller.savedRecipes.toggle({
			recipeId: recipe.id,
		});

		expect(result.saved).toBe(true);
	});

	it("unsaves a previously saved recipe on second toggle", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user);
		const caller = createAuthenticatedCaller(user);

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
		).rejects.toThrow(TRPCError);
	});
});

describe("savedRecipes.isSaved", () => {
	it("returns true for saved recipe", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user);
		const caller = createAuthenticatedCaller(user);

		await caller.savedRecipes.toggle({ recipeId: recipe.id });
		const result = await caller.savedRecipes.isSaved({
			recipeId: recipe.id,
		});

		expect(result.saved).toBe(true);
	});

	it("returns false for unsaved recipe", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user);
		const caller = createAuthenticatedCaller(user);

		const result = await caller.savedRecipes.isSaved({
			recipeId: recipe.id,
		});

		expect(result.saved).toBe(false);
	});
});

describe("savedRecipes.getUserSavedRecipes", () => {
	it("returns saved recipes with recipe data", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user, {
			title: "Saved Recipe",
		});
		const caller = createAuthenticatedCaller(user);

		await caller.savedRecipes.toggle({ recipeId: recipe.id });
		const recipes = await caller.savedRecipes.getUserSavedRecipes();

		expect(recipes).toHaveLength(1);
		expect(recipes[0]!.title).toBe("Saved Recipe");
	});

	it("returns empty array when no saved recipes", async () => {
		const user = await createTestUser();
		const caller = createAuthenticatedCaller(user);

		const recipes = await caller.savedRecipes.getUserSavedRecipes();

		expect(recipes).toEqual([]);
	});

	it("only returns recipes saved by authenticated user", async () => {
		const user1 = await createTestUser();
		const user2 = await createTestUser();
		const recipe = await createTestRecipe(user1, {
			title: "User1 Saved",
		});

		const caller1 = createAuthenticatedCaller(user1);
		await caller1.savedRecipes.toggle({ recipeId: recipe.id });

		const caller2 = createAuthenticatedCaller(user2);
		const recipes = await caller2.savedRecipes.getUserSavedRecipes();

		expect(recipes).toEqual([]);
	});
});
