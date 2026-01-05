// ABOUTME: Parses Instagram CDN URLs to extract expiration timestamp from query parameters
// ABOUTME: Instagram URLs contain oe= (expiration timestamp) and oh= (hash) parameters

/**
 * Extracts the expiration timestamp from an Instagram CDN URL
 * Instagram CDN URLs contain a parameter `oe=` which is a Unix timestamp
 *
 * @param url - Instagram CDN URL (e.g., https://...cdninstagram.com/...&oe=67A12345&oh=...)
 * @returns Date object representing when the URL expires, or null if not found
 *
 * @example
 * const expiresAt = parseInstagramUrlExpiration("https://...&oe=67A12345&oh=...");
 * // Returns: Date object for Unix timestamp 0x67A12345
 */
export function parseInstagramUrlExpiration(url: string): Date | null {
  try {
    const urlObj = new URL(url);
    const oeParam = urlObj.searchParams.get("oe");

    if (!oeParam) {
      console.warn("No 'oe' parameter found in Instagram URL:", url);
      return null;
    }

    // The oe parameter is a hexadecimal Unix timestamp
    const timestampHex = oeParam;
    const timestampSeconds = parseInt(timestampHex, 16);

    if (isNaN(timestampSeconds)) {
      console.warn("Invalid hex timestamp in 'oe' parameter:", oeParam);
      return null;
    }

    // Convert Unix timestamp (seconds) to milliseconds for JavaScript Date
    const expirationDate = new Date(timestampSeconds * 1000);

    // Validate that the date is reasonable (not in the past, not too far in the future)
    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    if (expirationDate < now) {
      console.warn("Expiration date is in the past:", expirationDate);
      return expirationDate; // Still return it, might be useful to know it's expired
    }

    if (expirationDate > oneYearFromNow) {
      console.warn("Expiration date is more than 1 year away, seems suspicious:", expirationDate);
    }

    return expirationDate;
  } catch (error) {
    console.error("Error parsing Instagram URL expiration:", error);
    return null;
  }
}

/**
 * Checks if an Instagram CDN URL is expired or will expire soon
 *
 * @param url - Instagram CDN URL
 * @param bufferHours - How many hours before expiration to consider it "expired" (default: 24)
 * @returns true if the URL is expired or will expire within the buffer period
 */
export function isInstagramUrlExpired(url: string, bufferHours: number = 24): boolean {
  const expiresAt = parseInstagramUrlExpiration(url);

  if (!expiresAt) {
    // If we can't determine expiration, assume it might be expired
    return true;
  }

  const now = new Date();
  const bufferMs = bufferHours * 60 * 60 * 1000;
  const expirationWithBuffer = new Date(expiresAt.getTime() - bufferMs);

  return now >= expirationWithBuffer;
}
