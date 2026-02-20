// ABOUTME: Polar customer portal route handler
// ABOUTME: Redirects authenticated users to their Polar customer portal

import { CustomerPortal } from "@polar-sh/nextjs";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { auth } from "@/server/better-auth";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

export const GET = CustomerPortal({
  accessToken: env.POLAR_ACCESS_TOKEN,
  getCustomerId: async (req) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) throw new Error("Unauthorized");
    const [dbUser] = await db
      .select({ polarCustomerId: user.polarCustomerId })
      .from(user)
      .where(eq(user.id, session.user.id));
    if (!dbUser?.polarCustomerId) throw new Error("No Polar customer");
    return dbUser.polarCustomerId;
  },
  returnUrl: env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  server: env.POLAR_SERVER,
});
