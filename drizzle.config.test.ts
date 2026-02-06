// ABOUTME: Drizzle config for test database
// ABOUTME: Reads DATABASE_URL from process.env directly to avoid @t3-oss/env-nextjs validation

import type { Config } from "drizzle-kit";

export default {
	schema: "./src/server/db/schema/*",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
} satisfies Config;
