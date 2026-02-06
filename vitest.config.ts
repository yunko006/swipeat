// ABOUTME: Vitest configuration for integration tests
// ABOUTME: Uses real PostgreSQL via Docker, mocks external APIs

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.test.ts"],
		setupFiles: ["./src/test/setup.ts"],
		globalSetup: ["./src/test/global-setup.ts"],
		testTimeout: 30_000,
		hookTimeout: 30_000,
		fileParallelism: false,
		env: {
			SKIP_ENV_VALIDATION: "1",
			NODE_ENV: "test",
			DATABASE_URL: "postgresql://test:test@localhost:5433/swipeat_test",
			RAPIDAPI_KEY: "test-rapidapi-key",
			ANTHROPIC_API_KEY: "test-anthropic-key",
			TWELVE_LABS_API_KEY: "test-twelve-labs-key",
			TWELVE_LABS_INDEX_ID: "test-index-id",
			POLAR_ACCESS_TOKEN: "test-polar-token",
			POLAR_WEBHOOK_SECRET: "test-webhook-secret",
			POLAR_SUCCESS_URL: "http://localhost:3000/success",
			BETTER_AUTH_SECRET: "test-auth-secret-at-least-32-characters-long",
			CRON_SECRET: "test-cron-secret",
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
});
