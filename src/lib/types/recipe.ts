// ABOUTME: Recipe type definitions
// ABOUTME: Shared types for recipe data across components

export interface Recipe {
  id: string;
  title: string;
  imageUrl: string | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  sourcePlatform: "tiktok" | "instagram" | "youtube";
  description: string | null;
  videoUrl: string | null;
  sourceUrl: string;
  ingredients: Array<{
    name: string;
    quantity?: string;
    unit?: string;
    notes?: string;
  }>;
  steps: Array<{
    order: number;
    instruction: string;
    durationMinutes?: number;
    videoStartTime?: number;
    videoEndTime?: number;
    videoClipUrl?: string;
  }>;
  createdAt: Date;
  createdByUserId: string | null;
}
