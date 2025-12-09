import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

import { env } from "@/env";
import { db } from "@/server/db";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: env.POLAR_SERVER,
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        // Sync customer deletion with Polar
        await polarClient.customers.deleteExternal({
          externalId: user.id,
        });
      },
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "71199209-ee7d-4558-a0e7-d10cf2ef3351",
              slug: "swipeat", // Custom slug for easy reference in Checkout URL, e.g. /checkout/swipeat
            },
          ],
          successUrl: env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal({
          returnUrl: env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
        }),
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
