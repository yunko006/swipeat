// ABOUTME: Database enums
// ABOUTME: Shared enum types used across recipe tables

import { pgEnum } from "drizzle-orm/pg-core";

export const sourcePlatformEnum = pgEnum("source_platform", [
	"tiktok",
	"instagram",
	"youtube",
]);
