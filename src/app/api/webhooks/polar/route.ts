// ABOUTME: Polar webhook route handler
// ABOUTME: Receives Polar events and updates user subscription state in DB

import { Webhooks } from "@polar-sh/nextjs";
import { env } from "@/env";
import { db } from "@/server/db";
import { handlePolarPayload } from "./handlers";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    await handlePolarPayload(payload, db);
  },
});
