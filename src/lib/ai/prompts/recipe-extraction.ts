// ABOUTME: Recipe extraction prompts
// ABOUTME: AI prompts for extracting recipe data from social media descriptions

export function buildRecipeExtractionPrompt(description: string): string {
	return `You are an expert in recipe analysis. Your task is to extract structured recipe information from an Instagram/TikTok video description.

## Recipe description:
${description}

## Instructions:

**IMPORTANT: Extract ALL information in ENGLISH, regardless of the source language.**

1. **Ingredients**: Identify ALL mentioned ingredients with exact quantities if available
   - If quantity is not mentioned, make it optional
   - Standardize units (e.g., "tablespoon" → "tbsp", "cuillère à soupe" → "tbsp")
   - If ingredient is mentioned without quantity, include it anyway
   - Translate ingredient names to English

2. **Steps**: Break down the recipe into clear, actionable steps
   - Each step should be a distinct action
   - Number steps in chronological order
   - Estimate duration if not explicitly mentioned
   - Write all instructions in English

3. **Prep/Cook time**: Extract or reasonably estimate
   - Differentiate prep time (cutting, mixing) from cook time
   - If not mentioned, estimate based on recipe type

4. **Servings**: Identify how many people this serves
   - If not mentioned, estimate based on quantities

## Important rules:
- Be precise and faithful to the description
- If information is missing, use your culinary expertise to make reasonable estimates
- Quantities should be practical (not "0.333" but rather "1/3")
- Steps should be short and clear
- ALL output must be in English`;
}

export function buildRecipeExtractionFromVideoPrompt(
	description: string,
	videoUrl: string,
): string {
	return `You are an expert in recipe analysis. Your task is to extract structured recipe information from a social media recipe video.

## Available information:

**Video description:**
${description}

**Video URL:**
${videoUrl}

## Instructions:

**IMPORTANT: Extract ALL information in ENGLISH, regardless of the source language.**

Use PRIMARILY the description to extract information. The video can serve as supplementary visual context.

1. **Ingredients**: List ALL ingredients mentioned in the description (translate to English)
2. **Steps**: Break down the recipe into clear steps based on the description (write in English)
3. **Time and servings**: Extract or reasonably estimate

Note: For now, we don't directly analyze the video - focus on the textual description.`;
}
