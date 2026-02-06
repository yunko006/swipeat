// ABOUTME: Tests for Instagram URL expiration parsing
// ABOUTME: Validates hex timestamp extraction and expiration checks

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	parseInstagramUrlExpiration,
	isInstagramUrlExpired,
} from "./parse-expiration";

describe("parseInstagramUrlExpiration", () => {
	it("parses a valid hex timestamp from oe= param", () => {
		// 0x67A12345 = 1738604357 seconds = 2025-02-03T...
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oe=67A12345&oh=abc123";
		const result = parseInstagramUrlExpiration(url);

		expect(result).toBeInstanceOf(Date);
		expect(result!.getTime()).toBe(0x67a12345 * 1000);
	});

	it("returns null for URL without oe= param", () => {
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oh=abc123";
		const result = parseInstagramUrlExpiration(url);

		expect(result).toBeNull();
	});

	it("returns null for invalid hex value in oe= param", () => {
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oe=ZZZZZZ&oh=abc123";
		const result = parseInstagramUrlExpiration(url);

		expect(result).toBeNull();
	});

	it("returns null for malformed URL", () => {
		const result = parseInstagramUrlExpiration("not-a-url");

		expect(result).toBeNull();
	});

	it("still returns the date even when it is in the past", () => {
		// 0x00000001 = 1 second since epoch = 1970-01-01
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oe=00000001";
		const result = parseInstagramUrlExpiration(url);

		expect(result).toBeInstanceOf(Date);
		expect(result!.getTime()).toBe(1000);
	});
});

describe("isInstagramUrlExpired", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns true for URL that has already expired", () => {
		// Set current time
		vi.setSystemTime(new Date("2025-06-01T00:00:00Z"));

		// oe corresponds to 2025-01-01 (in the past)
		// 2025-01-01T00:00:00Z = 1735689600 = 0x67752C00
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oe=67752C00";
		expect(isInstagramUrlExpired(url)).toBe(true);
	});

	it("returns false for URL far from expiration", () => {
		// Set current time to 2025-01-01
		vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));

		// oe corresponds to 2025-06-01 (5 months away, way beyond 24h buffer)
		// 2025-06-01T00:00:00Z = 1748736000 = 0x68393E00
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oe=68393E00";
		expect(isInstagramUrlExpired(url)).toBe(false);
	});

	it("returns true when within buffer period", () => {
		// Set current time to 2025-01-01T00:00:00Z
		vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));

		// oe corresponds to 2025-01-01T12:00:00Z (12 hours away, within 24h buffer)
		// 2025-01-01T12:00:00Z = 1735732800 = 0x67752E40
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oe=67752E40";
		expect(isInstagramUrlExpired(url, 24)).toBe(true);
	});

	it("returns true when URL has no oe= param", () => {
		const url =
			"https://scontent.cdninstagram.com/v/t1.0/image.jpg?oh=abc123";
		expect(isInstagramUrlExpired(url)).toBe(true);
	});
});
