// ABOUTME: Integration tests for recipe tRPC router
// ABOUTME: Tests CRUD operations, AI extraction, and ownership checks against real DB

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createTestUser } from "@/test/helpers/auth";
import { createTestRecipe } from "@/test/helpers/recipes";
import {
	createAuthenticatedCaller,
	createUnauthenticatedCaller,
	createSubscribedCaller,
} from "@/test/helpers/trpc";
import { extractRecipeFromDescription } from "@/lib/ai/extract-recipe";
import { analyzeRecipeVideo } from "@/lib/twelve-labs/analyze-video";

const mockExtract = vi.mocked(extractRecipeFromDescription);
const mockAnalyze = vi.mocked(analyzeRecipeVideo);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("recipe.save", () => {
	it("creates a recipe and returns isNew: true", async () => {
		const { caller } = await createSubscribedCaller();

		const result = await caller.recipe.save({
			sourceUrl: "https://instagram.com/reel/NEW123",
			sourcePlatform: "instagram",
			title: "My Recipe",
		});

		expect(result.success).toBe(true);
		expect(result.isNew).toBe(true);
		expect(result.recipeId).toBeDefined();
	});

	it("returns existing recipe when sourceUrl already exists", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const existing = await createTestRecipe(testUser, {
			sourceUrl: "https://instagram.com/reel/EXISTING",
		});

		const result = await caller.recipe.save({
			sourceUrl: "https://instagram.com/reel/EXISTING",
			sourcePlatform: "instagram",
			title: "Duplicate",
		});

		expect(result.success).toBe(true);
		expect(result.isNew).toBe(false);
		expect(result.recipeId).toBe(existing.id);
	});

	it("requires authentication", async () => {
		const caller = createUnauthenticatedCaller();

		await expect(
			caller.recipe.save({
				sourceUrl: "https://instagram.com/reel/UNAUTH",
				sourcePlatform: "instagram",
				title: "Unauthorized",
			}),
		).rejects.toThrow(TRPCError);
	});
});

describe("recipe.getById", () => {
	it("returns recipe by UUID", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user, {
			title: "Find Me",
		});
		const caller = createAuthenticatedCaller(user);

		const found = await caller.recipe.getById({ id: recipe.id });

		expect(found).not.toBeNull();
		expect(found!.title).toBe("Find Me");
	});

	it("returns null for non-existent UUID", async () => {
		const user = await createTestUser();
		const caller = createAuthenticatedCaller(user);

		const found = await caller.recipe.getById({
			id: "00000000-0000-0000-0000-000000000000",
		});

		expect(found).toBeNull();
	});
});

describe("recipe.getBySourceUrl", () => {
	it("returns recipe by source URL", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		await createTestRecipe(testUser, {
			sourceUrl: "https://instagram.com/reel/FINDME",
			title: "Found Recipe",
		});

		const found = await caller.recipe.getBySourceUrl({
			sourceUrl: "https://instagram.com/reel/FINDME",
		});

		expect(found).not.toBeUndefined();
		expect(found!.title).toBe("Found Recipe");
	});
});

describe("recipe.extractAndSave", () => {
	it("calls AI extraction and saves recipe with extracted data", async () => {
		const { caller } = await createSubscribedCaller();

		mockExtract.mockResolvedValueOnce({
			ingredients: [{ name: "Flour", quantity: "200", unit: "g" }],
			steps: [
				{ order: 1, instruction: "Mix flour", durationMinutes: 5 },
			],
			prepTimeMinutes: 10,
			cookTimeMinutes: 20,
			servings: 4,
		});

		const result = await caller.recipe.extractAndSave({
			sourceUrl: "https://instagram.com/reel/EXTRACT1",
			sourcePlatform: "instagram",
			description: "My recipe\nStep 1: Mix flour",
		});

		expect(result.success).toBe(true);
		expect(result.isNew).toBe(true);
		expect(result.extracted!.ingredients).toHaveLength(1);
		expect(result.extracted!.steps).toHaveLength(1);
		expect(mockExtract).toHaveBeenCalledWith(
			"My recipe\nStep 1: Mix flour",
		);
	});

	it("returns existing recipe if sourceUrl already exists", async () => {
		const { caller, testUser } = await createSubscribedCaller();
		const existing = await createTestRecipe(testUser, {
			sourceUrl: "https://instagram.com/reel/EXISTING2",
		});

		const result = await caller.recipe.extractAndSave({
			sourceUrl: "https://instagram.com/reel/EXISTING2",
			sourcePlatform: "instagram",
			description: "Won't be extracted",
		});

		expect(result.success).toBe(true);
		expect(result.isNew).toBe(false);
		expect(result.recipeId).toBe(existing.id);
		expect(mockExtract).not.toHaveBeenCalled();
	});

	it("handles video analysis failure gracefully", async () => {
		const { caller } = await createSubscribedCaller();

		mockExtract.mockResolvedValueOnce({
			ingredients: [{ name: "Water" }],
			steps: [{ order: 1, instruction: "Boil water" }],
		});
		mockAnalyze.mockRejectedValueOnce(new Error("Twelve Labs down"));

		const result = await caller.recipe.extractAndSave({
			sourceUrl: "https://instagram.com/reel/FAILVIDEO",
			sourcePlatform: "instagram",
			description: "Boil water recipe",
			videoUrl: "https://example.com/video.mp4",
		});

		expect(result.success).toBe(true);
		expect(result.isNew).toBe(true);
		// Steps should be saved without timestamps
		expect((result.extracted!.steps[0] as any).videoStartTime).toBeUndefined();
	});

	it("merges Twelve Labs timestamps into steps", async () => {
		const { caller } = await createSubscribedCaller();

		mockExtract.mockResolvedValueOnce({
			ingredients: [{ name: "Pasta" }],
			steps: [
				{ order: 1, instruction: "Boil water" },
				{ order: 2, instruction: "Cook pasta" },
			],
		});
		mockAnalyze.mockResolvedValueOnce([
			{ step: 1, startSeconds: 10, endSeconds: 30 },
			{ step: 2, startSeconds: 35, endSeconds: 60 },
		]);

		const result = await caller.recipe.extractAndSave({
			sourceUrl: "https://instagram.com/reel/TIMESTAMPS",
			sourcePlatform: "instagram",
			description: "Pasta recipe",
			videoUrl: "https://example.com/pasta.mp4",
		});

		expect((result.extracted!.steps[0] as any).videoStartTime).toBe(10);
		expect((result.extracted!.steps[0] as any).videoEndTime).toBe(30);
		expect((result.extracted!.steps[1] as any).videoStartTime).toBe(35);
		expect((result.extracted!.steps[1] as any).videoEndTime).toBe(60);
	});
});

describe("recipe.getUserImportedRecipes", () => {
	it("returns only recipes created by the authenticated user", async () => {
		const user1 = await createTestUser();
		const user2 = await createTestUser();
		await createTestRecipe(user1, { title: "User1 Recipe" });
		await createTestRecipe(user2, { title: "User2 Recipe" });

		const caller = createAuthenticatedCaller(user1);
		const recipes = await caller.recipe.getUserImportedRecipes();

		expect(recipes).toHaveLength(1);
		expect(recipes[0]!.title).toBe("User1 Recipe");
	});

	it("returns empty array for user with no recipes", async () => {
		const user = await createTestUser();
		const caller = createAuthenticatedCaller(user);

		const recipes = await caller.recipe.getUserImportedRecipes();

		expect(recipes).toEqual([]);
	});
});

describe("recipe.updateStepTimings", () => {
	it("updates steps for own recipe", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user);
		const caller = createAuthenticatedCaller(user);

		const newSteps = [
			{
				order: 1,
				instruction: "Updated step",
				videoStartTime: 5,
				videoEndTime: 15,
			},
		];

		const result = await caller.recipe.updateStepTimings({
			recipeId: recipe.id,
			steps: newSteps,
		});

		expect(result.success).toBe(true);

		// Verify the update persisted
		const updated = await caller.recipe.getById({ id: recipe.id });
		expect((updated!.steps as any[])[0].instruction).toBe("Updated step");
		expect((updated!.steps as any[])[0].videoStartTime).toBe(5);
	});

	it("throws FORBIDDEN for other user's recipe", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const recipe = await createTestRecipe(owner);
		const caller = createAuthenticatedCaller(other);

		await expect(
			caller.recipe.updateStepTimings({
				recipeId: recipe.id,
				steps: [{ order: 1, instruction: "Hack" }],
			}),
		).rejects.toThrow(TRPCError);
	});

	it("throws NOT_FOUND for non-existent recipe", async () => {
		const user = await createTestUser();
		const caller = createAuthenticatedCaller(user);

		await expect(
			caller.recipe.updateStepTimings({
				recipeId: "00000000-0000-0000-0000-000000000000",
				steps: [{ order: 1, instruction: "Ghost" }],
			}),
		).rejects.toThrow(TRPCError);
	});
});

describe("recipe.reanalyzeTimings", () => {
	it("calls Twelve Labs and returns new steps with timestamps", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user, {
			videoUrl: "https://example.com/video.mp4",
			steps: [
				{ order: 1, instruction: "Step one" },
				{ order: 2, instruction: "Step two" },
			],
		});
		const caller = createAuthenticatedCaller(user);

		mockAnalyze.mockResolvedValueOnce([
			{ step: 1, startSeconds: 0, endSeconds: 20 },
			{ step: 2, startSeconds: 25, endSeconds: 50 },
		]);

		const result = await caller.recipe.reanalyzeTimings({
			recipeId: recipe.id,
			promptType: "advanced",
		});

		expect(result.success).toBe(true);
		expect(result.newSteps[0]!.videoStartTime).toBe(0);
		expect(result.newSteps[0]!.videoEndTime).toBe(20);
		expect(result.newSteps[1]!.videoStartTime).toBe(25);
	});

	it("throws FORBIDDEN for other user's recipe", async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const recipe = await createTestRecipe(owner, {
			videoUrl: "https://example.com/video.mp4",
		});
		const caller = createAuthenticatedCaller(other);

		await expect(
			caller.recipe.reanalyzeTimings({ recipeId: recipe.id }),
		).rejects.toThrow(TRPCError);
	});

	it("throws BAD_REQUEST when recipe has no videoUrl", async () => {
		const user = await createTestUser();
		const recipe = await createTestRecipe(user, {
			videoUrl: undefined,
		});
		const caller = createAuthenticatedCaller(user);

		await expect(
			caller.recipe.reanalyzeTimings({ recipeId: recipe.id }),
		).rejects.toThrow(TRPCError);
	});
});
