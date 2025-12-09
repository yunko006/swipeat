import { Checkout } from "@polar-sh/nextjs";
import { env } from "@/env";

export const GET = Checkout({
  accessToken: env.POLAR_ACCESS_TOKEN,
  successUrl: env.POLAR_SUCCESS_URL,
  returnUrl: env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  server: env.POLAR_SERVER,
});
