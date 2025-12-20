---
title: Twelve Labs Integration
description: Video analysis for recipe step timestamps
---

## Overview

Twelve Labs is integrated to analyze recipe videos and extract timestamps for each cooking step. This allows users to jump directly to specific steps in the video.

## How it Works

1. **Extract Recipe with AI**: Claude extracts the recipe steps from the description
2. **Analyze Video**: Twelve Labs receives the video URL and the list of steps
3. **Get Timestamps**: The AI identifies when each step starts in the video
4. **Merge Data**: Timestamps are merged with recipe steps in the database

## Configuration

Add your Twelve Labs API key to `.env`:

```bash
TWELVE_LABS_API_KEY=your_api_key_here
```

Get your API key from: https://playground.twelvelabs.io/

## Usage

The integration is automatic when a `videoUrl` is provided:

```typescript
// When extracting a recipe with a video URL
extractAndSave.mutate({
  sourceUrl: "https://www.instagram.com/p/...",
  sourcePlatform: "instagram",
  description: recipeDescription,
  imageUrl: thumbnailUrl,
  videoUrl: videoUrl, // Twelve Labs will analyze this
});
```

## Data Structure

Steps are stored with timestamps:

```json
{
  "order": 1,
  "instruction": "Simmer tofu in water",
  "durationMinutes": 5,
  "videoStartTime": 12.5
}
```

## Error Handling

If Twelve Labs analysis fails:
- The recipe is still saved
- Steps won't have timestamps
- Error is logged to console
- User can still view the recipe without video jumping

## Prompt Format

The prompt sent to Twelve Labs:

```
Identify the start time (in seconds) for each cooking step in this video:

1. Simmering tofu in water
2. Toasting Sichuan peppercorns
3. Browning ground beef
...

Return as JSON: [{ "step": 1, "startSeconds": X }, ...]
```

## Cost Optimization

- Analysis only runs when `videoUrl` is provided
- Failed analyses don't block recipe creation
- Timestamps are cached in the database
