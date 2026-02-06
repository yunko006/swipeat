// ABOUTME: Per-test-file setup
// ABOUTME: Database cleanup and module mocks applied before each test file

import { beforeEach, afterAll, vi } from "vitest";
import { testDb, cleanDatabase, closeDatabase } from "./helpers/db";

// Mock the global db module so ALL imports get the test DB
vi.mock("@/server/db", () => ({
	db: testDb,
}));

// Mock server-only to prevent import errors outside Next.js
vi.mock("server-only", () => ({}));

// Mock external API modules
vi.mock("@/lib/ai/extract-recipe");
vi.mock("@/lib/twelve-labs/analyze-video");
vi.mock("@/lib/twelve-labs/client");
vi.mock("@/lib/ai/providers");

// Mock Better Auth to avoid Polar SDK initialization
vi.mock("@/server/better-auth", () => ({
	auth: {
		api: {
			getSession: vi.fn().mockResolvedValue(null),
		},
	},
}));

beforeEach(async () => {
	await cleanDatabase();
});

afterAll(async () => {
	await closeDatabase();
});
