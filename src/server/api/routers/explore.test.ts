// ABOUTME: Integration tests for explore tRPC router
// ABOUTME: Tests recipe browsing, search, sorting, and pagination against real DB

import { describe, it, expect } from "vitest";
import { createTestUser } from "@/test/helpers/auth";
import { createTestRecipe } from "@/test/helpers/recipes";
import {
	createAuthenticatedCaller,
	createUnauthenticatedCaller,
} from "@/test/helpers/trpc";

describe("explore.list", () => {
	it("returns paginated recipes", async () => {
		const user = await createTestUser();
		await createTestRecipe(user, { title: "Recipe A" });
		await createTestRecipe(user, { title: "Recipe B" });
		const caller = createAuthenticatedCaller(user);

		const result = await caller.explore.list({});

		expect(result.items).toHaveLength(2);
		expect(result.total).toBe(2);
		expect(result.hasMore).toBe(false);
	});

	it("filters by search term on title", async () => {
		const user = await createTestUser();
		await createTestRecipe(user, { title: "Chocolate Cake" });
		await createTestRecipe(user, { title: "Pasta Carbonara" });
		const caller = createAuthenticatedCaller(user);

		const result = await caller.explore.list({ search: "chocolate" });

		expect(result.items).toHaveLength(1);
		expect(result.items[0]!.title).toBe("Chocolate Cake");
	});

	it("filters by search term on description", async () => {
		const user = await createTestUser();
		await createTestRecipe(user, {
			title: "Recipe A",
			description: "A delicious vegan meal",
		});
		await createTestRecipe(user, {
			title: "Recipe B",
			description: "Classic French cooking",
		});
		const caller = createAuthenticatedCaller(user);

		const result = await caller.explore.list({ search: "vegan" });

		expect(result.items).toHaveLength(1);
		expect(result.items[0]!.title).toBe("Recipe A");
	});

	it("sorts by recent by default", async () => {
		const user = await createTestUser();
		await createTestRecipe(user, { title: "Older Recipe" });
		// Small delay to ensure different createdAt
		await new Promise((r) => setTimeout(r, 10));
		await createTestRecipe(user, { title: "Newer Recipe" });
		const caller = createAuthenticatedCaller(user);

		const result = await caller.explore.list({});

		expect(result.items[0]!.title).toBe("Newer Recipe");
		expect(result.items[1]!.title).toBe("Older Recipe");
	});

	it("sorts by quick (prepTime ascending, nulls last)", async () => {
		const user = await createTestUser();
		await createTestRecipe(user, {
			title: "Slow Recipe",
			prepTimeMinutes: 60,
		});
		await createTestRecipe(user, {
			title: "Quick Recipe",
			prepTimeMinutes: 5,
		});
		await createTestRecipe(user, {
			title: "No Time Recipe",
			prepTimeMinutes: null,
		});
		const caller = createAuthenticatedCaller(user);

		const result = await caller.explore.list({ sortBy: "quick" });

		expect(result.items[0]!.title).toBe("Quick Recipe");
		expect(result.items[1]!.title).toBe("Slow Recipe");
		expect(result.items[2]!.title).toBe("No Time Recipe");
	});

	it("returns correct total count and hasMore", async () => {
		const user = await createTestUser();
		for (let i = 0; i < 5; i++) {
			await createTestRecipe(user, { title: `Recipe ${i}` });
		}
		const caller = createAuthenticatedCaller(user);

		const result = await caller.explore.list({ limit: 3, offset: 0 });

		expect(result.items).toHaveLength(3);
		expect(result.total).toBe(5);
		expect(result.hasMore).toBe(true);
	});

	it("respects limit and offset", async () => {
		const user = await createTestUser();
		for (let i = 0; i < 5; i++) {
			await createTestRecipe(user, { title: `Recipe ${i}` });
		}
		const caller = createAuthenticatedCaller(user);

		const page2 = await caller.explore.list({ limit: 2, offset: 2 });

		expect(page2.items).toHaveLength(2);
		expect(page2.total).toBe(5);
		expect(page2.hasMore).toBe(true);
	});

	it("includes createdBy user data", async () => {
		const user = await createTestUser({ name: "Chef Thomas" });
		await createTestRecipe(user);
		const caller = createAuthenticatedCaller(user);

		const result = await caller.explore.list({});

		expect(result.items[0]!.createdBy).toBeDefined();
		expect(result.items[0]!.createdBy!.name).toBe("Chef Thomas");
	});

	it("is accessible without authentication", async () => {
		const owner = await createTestUser();
		await createTestRecipe(owner, { title: "Public Recipe" });
		const caller = createUnauthenticatedCaller();

		const result = await caller.explore.list({});

		expect(result.items.length).toBeGreaterThanOrEqual(1);
	});
});
