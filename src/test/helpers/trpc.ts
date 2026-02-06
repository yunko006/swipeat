// ABOUTME: tRPC test caller factory
// ABOUTME: Creates authenticated and unauthenticated tRPC callers for tests

import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import { testDb } from "./db";
import type { TestUser } from "./auth";
import { createTestSession } from "./auth";

const createCaller = createCallerFactory(appRouter);

export function createAuthenticatedCaller(testUser: TestUser) {
	const session = createTestSession(testUser);
	return createCaller({
		db: testDb as any,
		session: session as any,
		headers: new Headers(),
	});
}

export function createUnauthenticatedCaller() {
	return createCaller({
		db: testDb as any,
		session: null,
		headers: new Headers(),
	});
}
