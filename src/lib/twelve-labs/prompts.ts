// ABOUTME: Twelve Labs prompt templates for video analysis
// ABOUTME: Provides Basic and Advanced prompts for step timestamp detection

export type TwelveLabsPromptType = "basic" | "advanced" | "custom";

export interface TwelveLabsPromptOption {
  value: TwelveLabsPromptType;
  label: string;
  description: string;
  disabled?: boolean;
}

export const TWELVE_LABS_PROMPT_OPTIONS: TwelveLabsPromptOption[] = [
  {
    value: "basic",
    label: "Basic",
    description: "Simple timestamp detection",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Handles overlaps, confidence scores, and visual priority",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Write your own prompt",
    disabled: true,
  },
];

export function buildBasicPrompt(steps: string[]): string {
  const stepsPrompt = steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return `Identify the start time and end time (in seconds) for each cooking step in this video:

${stepsPrompt}

Return as JSON: [{ "step": 1, "startSeconds": X, "endSeconds": Y }, ...]`;
}

export function buildAdvancedPrompt(steps: string[]): string {
  const stepsPrompt = steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return `You are analyzing a cooking video.

Below is a list of possible cooking actions.
Some actions may:
- overlap in time
- happen simultaneously
- be combined into a single visual sequence
- be missing or only partially shown

Your task is to detect when each action actually occurs in the video
based primarily on visual cues (frames), and secondarily on audio cues.

TIMESTAMP RULES:
- Use the earliest visible frame where the action clearly begins as startSeconds
- Use the last visible frame where the action is still clearly visible as endSeconds
- Prefer visual evidence over narration or on-screen text
- If narration mentions an action but it is not visually shown, return null
- If multiple actions happen in the same visual time range, reuse the same timestamps
- If an action overlaps another, allow overlapping timestamps
- Do NOT force a strict sequence
- Do NOT invent actions that are not visually supported

Actions to detect:
1. Boil the pork spare ribs from cold water in a large pot
2. Skim the scum and rinse off any impurities from the ribs
3. Bring the ribs to a low boil again and add salt and shaoxing cooking wine
4. Add aromatics (green onion, ginger, bay leaf, star anise)
5. Continue cooking for about 20 minutes
6. Add daikon, carrots, and shiitake mushrooms
7. Cook until vegetables are soft and meat is very tender
8. Strain out the broth, then put the vegetables and meat back in
9. Serve hot

Return the result as JSON using this schema:

[
  {
    "step": 1,
    "description": "Boil the pork spare ribs from cold water in a large pot",
    "startSeconds": number | null,
    "endSeconds": number | null,
    "confidence": 0.0 - 1.0
  }
]
`;
}

export function buildPrompt(
  promptType: TwelveLabsPromptType,
  steps: string[],
  customPrompt?: string,
): string {
  switch (promptType) {
    case "basic":
      return buildBasicPrompt(steps);
    case "advanced":
      return buildAdvancedPrompt(steps);
    case "custom":
      if (!customPrompt) {
        throw new Error(
          "Custom prompt is required when using custom prompt type",
        );
      }
      return customPrompt;
    default:
      return buildBasicPrompt(steps);
  }
}
