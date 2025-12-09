import { Webhooks } from "@polar-sh/nextjs";
import { env } from "@/env";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    // Log ALL webhook events for testing
    console.log("=== POLAR WEBHOOK RECEIVED ===");
    console.log("Event type:", payload.type);
    console.log("Full payload:", JSON.stringify(payload, null, 2));
    console.log("==============================");
  },
});
