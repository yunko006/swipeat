import { CustomerPortal } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";
import { env } from "@/env";

export const GET = CustomerPortal({
  accessToken: env.POLAR_ACCESS_TOKEN,
  getCustomerId: async (req: NextRequest) => {
    // Return the Polar customer UUID
    // TODO: Replace with dynamic customer ID retrieval based on authenticated user
    return "2d4b6ec7-d779-411a-b3a2-a4131d6210f3";
  },
  returnUrl: env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  server: env.POLAR_SERVER,
});
