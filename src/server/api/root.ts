import { postRouter } from "@/server/api/routers/post";
import { recipeRouter } from "@/server/api/routers/recipe";
import { exploreRouter } from "@/server/api/routers/explore";
import { savedRecipesRouter } from "@/server/api/routers/saved-recipes";
import { subscriptionRouter } from "@/server/api/routers/subscription";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	post: postRouter,
	recipe: recipeRouter,
	explore: exploreRouter,
	savedRecipes: savedRecipesRouter,
	subscription: subscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
