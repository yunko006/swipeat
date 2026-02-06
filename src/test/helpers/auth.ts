// ABOUTME: Test authentication helpers
// ABOUTME: Creates test users and sessions for authenticated tRPC calls

import { testDb } from "./db";
import { user } from "@/server/db/schema";
import { randomUUID } from "crypto";

export interface TestUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export async function createTestUser(
	overrides: Partial<TestUser> = {},
): Promise<TestUser> {
	const id = overrides.id ?? randomUUID();
	const now = new Date();
	const testUser: TestUser = {
		id,
		name: overrides.name ?? `Test User ${id.slice(0, 8)}`,
		email: overrides.email ?? `test-${id.slice(0, 8)}@example.com`,
		emailVerified: overrides.emailVerified ?? false,
		image: overrides.image ?? null,
		createdAt: overrides.createdAt ?? now,
		updatedAt: overrides.updatedAt ?? now,
	};

	await testDb.insert(user).values(testUser);
	return testUser;
}

export function createTestSession(testUser: TestUser) {
	return {
		user: testUser,
		session: {
			id: randomUUID(),
			userId: testUser.id,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			token: randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	};
}
