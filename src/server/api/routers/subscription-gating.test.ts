// ABOUTME: Tests for subscription-based feature gating
// ABOUTME: Verifies subscribedProcedure enforcement and public procedure accessibility

import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { createTestUser } from "@/test/helpers/auth";
import { createTestRecipe } from "@/test/helpers/recipes";
import {
	createAuthenticatedCaller,
	createUnauthenticatedCaller,
	createSubscribedCaller,
} from "@/test/helpers/trpc";

// --- explore.list : doit être public ---

describe("explore.list access", () => {
	it("is accessible without authentication", async () => {
		const owner = await createTestUser();
		await createTestRecipe(owner, { title: "Public Recipe" });
		const caller = createUnauthenticatedCaller();

		const result = await caller.explore.list({});

		expect(result.items).toHaveLength(1);
	});

	it("is accessible with a free (non-subscribed) account", async () => {
		const owner = await createTestUser();
		await createTestRecipe(owner, { title: "Free Recipe" });
		const caller = createAuthenticatedCaller(owner);

		const result = await caller.explore.list({});

		expect(result.items).toHaveLength(1);
	});
});

// --- savedRecipes : doit être subscribedProcedure ---

describe("savedRecipes.toggle subscription gating", () => {
	it("rejects unauthenticated users with UNAUTHORIZED", async () => {
		const caller = createUnauthenticatedCaller();

		await expect(
			caller.savedRecipes.toggle({
				recipeId: "00000000-0000-0000-0000-000000000000",
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("rejects free (non-subscribed) users with FORBIDDEN", async () => {
		const freeUser = await createTestUser();
		const caller = createAuthenticatedCaller(freeUser);

		await expect(
			caller.savedRecipes.toggle({
				recipeId: "00000000-0000-0000-0000-000000000000",
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("allows subscribed users to toggle", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const recipe = await createTestRecipe(testUser, { title: "My Recipe" });

		const result = await caller.savedRecipes.toggle({ recipeId: recipe.id });

		expect(result.saved).toBe(true);
	});
});

describe("savedRecipes.isSaved subscription gating", () => {
	it("rejects free users with FORBIDDEN", async () => {
		const freeUser = await createTestUser();
		const caller = createAuthenticatedCaller(freeUser);

		await expect(
			caller.savedRecipes.isSaved({
				recipeId: "00000000-0000-0000-0000-000000000000",
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});
});

describe("savedRecipes.getUserSavedRecipes subscription gating", () => {
	it("rejects free users with FORBIDDEN", async () => {
		const freeUser = await createTestUser();
		const caller = createAuthenticatedCaller(freeUser);

		await expect(
			caller.savedRecipes.getUserSavedRecipes(),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});
});

// --- recipe.getById : doit être public ---

describe("recipe.getById access", () => {
	it("is accessible without authentication", async () => {
		const owner = await createTestUser();
		const recipe = await createTestRecipe(owner, { title: "Open Source Recipe" });
		const caller = createUnauthenticatedCaller();

		const result = await caller.recipe.getById({ id: recipe.id });

		expect(result).not.toBeNull();
		expect(result?.title).toBe("Open Source Recipe");
	});
});

// --- recipe.getBySourceUrl : doit être subscribedProcedure ---

describe("recipe.getBySourceUrl subscription gating", () => {
	it("rejects free users with FORBIDDEN", async () => {
		const freeUser = await createTestUser();
		const caller = createAuthenticatedCaller(freeUser);

		await expect(
			caller.recipe.getBySourceUrl({ sourceUrl: "https://instagram.com/p/abc" }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("allows subscribed users", async () => {
		const { caller } = await createSubscribedCaller();

		const result = await caller.recipe.getBySourceUrl({
			sourceUrl: "https://instagram.com/p/nonexistent",
		});

		expect(result).toBeUndefined();
	});
});

// --- recipe.save : doit être subscribedProcedure ---

describe("recipe.save subscription gating", () => {
	it("rejects free users with FORBIDDEN", async () => {
		const freeUser = await createTestUser();
		const caller = createAuthenticatedCaller(freeUser);

		await expect(
			caller.recipe.save({
				sourceUrl: "https://instagram.com/p/abc",
				sourcePlatform: "instagram",
				title: "Test",
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});
});
