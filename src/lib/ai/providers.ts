// ABOUTME: AI provider configurations
// ABOUTME: Setup and configuration for AI SDK providers (Claude, OpenAI, etc.)

import { createAnthropic } from "@ai-sdk/anthropic";
import { env } from "@/env";

const anthropic = createAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export const aiProviders = {
  claude: {
    sonnet: anthropic("claude-sonnet-4-20250514"),
    haiku: anthropic("claude-3-5-haiku-20241022"),
  },
} as const;

export const defaultRecipeExtractionModel = aiProviders.claude.sonnet;
