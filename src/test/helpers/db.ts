// ABOUTME: Test database connection and cleanup utilities
// ABOUTME: Provides a shared test DB instance and table truncation

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "@/server/db/schema";

const TEST_DATABASE_URL =
	"postgresql://test:test@localhost:5433/swipeat_test";

const conn = postgres(TEST_DATABASE_URL);
export const testDb = drizzle(conn, { schema });

export async function cleanDatabase() {
	await testDb.execute(sql`
		TRUNCATE TABLE
			swipeat_timing_corrections,
			swipeat_collection_recipes,
			swipeat_recipe_comments,
			swipeat_recipe_likes,
			swipeat_user_recipe_views,
			swipeat_user_saved_recipes,
			swipeat_collections,
			swipeat_recipes,
			session,
			account,
			verification,
			"user"
		CASCADE
	`);
}

export async function closeDatabase() {
	await conn.end();
}
