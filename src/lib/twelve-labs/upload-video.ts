// ABOUTME: Video upload to Twelve Labs
// ABOUTME: Handles indexing videos from Instagram URLs for analysis

import { twelveLabsClient } from "./client";
import { env } from "@/env";

export async function uploadVideoToTwelveLabs(
  videoUrl: string
): Promise<string> {
  console.log("Starting video upload to Twelve Labs:", videoUrl);

  // Create indexing task with Instagram video URL
  const task = await twelveLabsClient.tasks.create({
    indexId: env.TWELVE_LABS_INDEX_ID,
    videoUrl: videoUrl,
  });

  if (!task.id) {
    throw new Error("No task ID returned from Twelve Labs");
  }

  console.log(`Created task id=${task.id} for video indexing`);

  // Wait for indexing to complete (check every 5 seconds)
  const completedTask = await twelveLabsClient.tasks.waitForDone(task.id, {
    sleepInterval: 5,
    callback: (task) => {
      console.log(`Indexing status: ${task.status}`);
    },
  });

  if (completedTask.status !== "ready") {
    throw new Error(`Video indexing failed with status ${completedTask.status}`);
  }

  if (!completedTask.videoId) {
    throw new Error("No videoId returned from Twelve Labs");
  }

  console.log(`Video indexed successfully. Video id=${completedTask.videoId}`);

  return completedTask.videoId;
}
