// ABOUTME: Hook to check user subscription status
// ABOUTME: Reads subscription_status from DB via tRPC

"use client";

import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/react";

export function useSubscription() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const { data, isLoading } = api.subscription.isActive.useQuery(undefined, {
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

  return {
    isLoggedIn,
    isSubscribed: data?.isActive ?? false,
    isLoading: isLoggedIn && isLoading,
  };
}
