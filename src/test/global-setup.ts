// ABOUTME: Global test setup and teardown
// ABOUTME: Manages Docker test database lifecycle and schema migration

import { execSync } from "child_process";

function waitForPostgres(maxRetries = 30, delayMs = 1000): Promise<void> {
	return new Promise((resolve, reject) => {
		let retries = 0;

		const check = () => {
			try {
				execSync(
					'docker compose -f docker-compose.test.yml exec -T test-db pg_isready -U test',
					{ stdio: "pipe" },
				);
				resolve();
			} catch {
				retries++;
				if (retries >= maxRetries) {
					reject(new Error("PostgreSQL did not become ready in time"));
					return;
				}
				setTimeout(check, delayMs);
			}
		};

		check();
	});
}

export async function setup() {
	console.log("Starting test database...");
	execSync("docker compose -f docker-compose.test.yml up -d", {
		stdio: "inherit",
	});

	await waitForPostgres();
	console.log("Test database is ready");

	console.log("Pushing schema to test database...");
	execSync("npx drizzle-kit push --config drizzle.config.test.ts", {
		stdio: "inherit",
		env: {
			...process.env,
			DATABASE_URL: "postgresql://test:test@localhost:5433/swipeat_test",
			SKIP_ENV_VALIDATION: "1",
		},
	});
	console.log("Schema pushed successfully");
}

export async function teardown() {
	console.log("Stopping test database...");
	execSync("docker compose -f docker-compose.test.yml down", {
		stdio: "inherit",
	});
	console.log("Test database stopped");
}
