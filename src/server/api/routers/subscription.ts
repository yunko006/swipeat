// ABOUTME: Subscription tRPC router
// ABOUTME: Exposes subscription status from DB for client-side use

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const subscriptionRouter = createTRPCRouter({
	isActive: protectedProcedure.query(async ({ ctx }) => {
		const [dbUser] = await ctx.db
			.select({ subscriptionStatus: user.subscriptionStatus })
			.from(user)
			.where(eq(user.id, ctx.session.user.id));
		return { isActive: dbUser?.subscriptionStatus === "active" };
	}),
});
