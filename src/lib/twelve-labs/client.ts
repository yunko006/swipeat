// ABOUTME: Twelve Labs client configuration
// ABOUTME: Setup and initialization for video analysis API

import { TwelveLabs } from "twelvelabs-js";
import { env } from "@/env";

export const twelveLabsClient = new TwelveLabs({
	apiKey: env.TWELVE_LABS_API_KEY,
});
