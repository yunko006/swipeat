// ABOUTME: Smoke test for test infrastructure
// ABOUTME: Validates that the test DB connection and cleanup work correctly

import { describe, it, expect } from "vitest";
import { sql } from "drizzle-orm";
import { testDb } from "./helpers/db";

describe("test infrastructure", () => {
	it("connects to the test database", async () => {
		const result = await testDb.execute(sql`SELECT 1 as value`);
		expect(result[0]!.value).toBe(1);
	});

	it("can query the recipes table", async () => {
		const result = await testDb.query.recipes.findMany();
		expect(result).toEqual([]);
	});
});
