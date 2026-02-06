// ABOUTME: Tests for Twelve Labs prompt builders
// ABOUTME: Validates prompt formatting for video analysis

import { describe, it, expect } from "vitest";
import {
	buildBasicPrompt,
	buildAdvancedPrompt,
	buildPrompt,
} from "./prompts";

const testSteps = [
	"Boil water in a large pot",
	"Add pasta and cook for 10 minutes",
	"Drain and serve",
];

describe("buildBasicPrompt", () => {
	it("formats steps into a numbered list with JSON instruction", () => {
		const result = buildBasicPrompt(testSteps);

		expect(result).toContain("1. Boil water in a large pot");
		expect(result).toContain("2. Add pasta and cook for 10 minutes");
		expect(result).toContain("3. Drain and serve");
		expect(result).toContain('"step"');
		expect(result).toContain('"startSeconds"');
		expect(result).toContain('"endSeconds"');
	});
});

describe("buildAdvancedPrompt", () => {
	it("includes overlap and confidence rules", () => {
		const result = buildAdvancedPrompt(testSteps);

		expect(result).toContain("1. Boil water in a large pot");
		expect(result).toContain("overlap");
		expect(result).toContain("confidence");
		expect(result).toContain("null");
	});
});

describe("buildPrompt", () => {
	it("delegates to basic builder for basic type", () => {
		const result = buildPrompt("basic", testSteps);
		const expected = buildBasicPrompt(testSteps);

		expect(result).toBe(expected);
	});

	it("delegates to advanced builder for advanced type", () => {
		const result = buildPrompt("advanced", testSteps);
		const expected = buildAdvancedPrompt(testSteps);

		expect(result).toBe(expected);
	});

	it("throws for custom type without prompt", () => {
		expect(() => buildPrompt("custom", testSteps)).toThrow(
			"Custom prompt is required",
		);
	});

	it("returns custom prompt when provided", () => {
		const customPrompt = "My custom analysis prompt";
		const result = buildPrompt("custom", testSteps, customPrompt);

		expect(result).toBe(customPrompt);
	});
});
