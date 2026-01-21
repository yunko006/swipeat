// ABOUTME: Shared types for the timing editor components
// ABOUTME: Defines Step type and color constants

export interface Step {
	order: number;
	instruction: string;
	durationMinutes?: number;
	videoStartTime?: number;
	videoEndTime?: number;
	videoClipUrl?: string;
}

export const STEP_COLORS = [
	{ bg: "bg-blue-500", border: "border-blue-300", range: "bg-blue-500/30" },
	{ bg: "bg-green-500", border: "border-green-300", range: "bg-green-500/30" },
	{ bg: "bg-yellow-500", border: "border-yellow-300", range: "bg-yellow-500/30" },
	{ bg: "bg-purple-500", border: "border-purple-300", range: "bg-purple-500/30" },
	{ bg: "bg-pink-500", border: "border-pink-300", range: "bg-pink-500/30" },
	{ bg: "bg-orange-500", border: "border-orange-300", range: "bg-orange-500/30" },
	{ bg: "bg-cyan-500", border: "border-cyan-300", range: "bg-cyan-500/30" },
	{ bg: "bg-red-500", border: "border-red-300", range: "bg-red-500/30" },
] as const;

export function getStepColor(index: number): (typeof STEP_COLORS)[number] {
	return STEP_COLORS[index % STEP_COLORS.length]!;
}

export function formatTimecode(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}
