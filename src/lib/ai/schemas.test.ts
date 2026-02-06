// ABOUTME: Tests for AI response schemas
// ABOUTME: Validates Zod schemas for recipe extraction data

import { describe, it, expect } from "vitest";
import {
	ingredientSchema,
	recipeStepSchema,
	recipeExtractionSchema,
} from "./schemas";

describe("ingredientSchema", () => {
	it("parses a complete ingredient", () => {
		const result = ingredientSchema.parse({
			name: "Flour",
			quantity: "200",
			unit: "g",
			notes: "sifted",
		});

		expect(result).toEqual({
			name: "Flour",
			quantity: "200",
			unit: "g",
			notes: "sifted",
		});
	});

	it("accepts optional quantity, unit, and notes", () => {
		const result = ingredientSchema.parse({
			name: "Salt",
		});

		expect(result.name).toBe("Salt");
		expect(result.quantity).toBeUndefined();
		expect(result.unit).toBeUndefined();
		expect(result.notes).toBeUndefined();
	});

	it("rejects missing name", () => {
		const result = ingredientSchema.safeParse({
			quantity: "200",
		});

		expect(result.success).toBe(false);
	});
});

describe("recipeStepSchema", () => {
	it("parses a complete step", () => {
		const result = recipeStepSchema.parse({
			order: 1,
			instruction: "Mix all ingredients together",
			durationMinutes: 5,
		});

		expect(result).toEqual({
			order: 1,
			instruction: "Mix all ingredients together",
			durationMinutes: 5,
		});
	});

	it("requires order and instruction", () => {
		expect(
			recipeStepSchema.safeParse({ order: 1 }).success,
		).toBe(false);
		expect(
			recipeStepSchema.safeParse({ instruction: "Mix" }).success,
		).toBe(false);
	});

	it("accepts optional durationMinutes", () => {
		const result = recipeStepSchema.parse({
			order: 1,
			instruction: "Mix",
		});

		expect(result.durationMinutes).toBeUndefined();
	});
});

describe("recipeExtractionSchema", () => {
	it("parses valid extraction data", () => {
		const result = recipeExtractionSchema.parse({
			ingredients: [
				{ name: "Flour", quantity: "200", unit: "g" },
				{ name: "Sugar", quantity: "100", unit: "g" },
			],
			steps: [
				{ order: 1, instruction: "Mix dry ingredients" },
				{ order: 2, instruction: "Bake at 180C" },
			],
			prepTimeMinutes: 10,
			cookTimeMinutes: 30,
			servings: 4,
		});

		expect(result.ingredients).toHaveLength(2);
		expect(result.steps).toHaveLength(2);
		expect(result.prepTimeMinutes).toBe(10);
		expect(result.cookTimeMinutes).toBe(30);
		expect(result.servings).toBe(4);
	});

	it("rejects missing required fields", () => {
		expect(
			recipeExtractionSchema.safeParse({}).success,
		).toBe(false);

		expect(
			recipeExtractionSchema.safeParse({
				ingredients: [],
			}).success,
		).toBe(false);
	});

	it("accepts optional time and servings fields", () => {
		const result = recipeExtractionSchema.parse({
			ingredients: [{ name: "Water" }],
			steps: [{ order: 1, instruction: "Boil" }],
		});

		expect(result.prepTimeMinutes).toBeUndefined();
		expect(result.cookTimeMinutes).toBeUndefined();
		expect(result.servings).toBeUndefined();
	});
});
