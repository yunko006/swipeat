// ABOUTME: Hook to check user subscription status
// ABOUTME: Fetches customer state from Polar via Better Auth endpoint

"use client";

import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

interface CustomerState {
  activeSubscriptions: Array<{ status: string }>;
}

async function fetchCustomerState(): Promise<CustomerState | null> {
  const res = await fetch("/api/auth/customer/state");
  if (!res.ok) return null;
  return res.json() as Promise<CustomerState>;
}

export function useSubscription() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const { data, isLoading } = useQuery({
    queryKey: ["customer-state"],
    queryFn: fetchCustomerState,
    enabled: isLoggedIn,
    staleTime: 30_000, // 30s — acceptable pour éviter trop de requêtes
  });

  const isSubscribed =
    isLoggedIn &&
    (data?.activeSubscriptions?.length ?? 0) > 0 &&
    data!.activeSubscriptions.some((s) => s.status === "active");

  return {
    isLoggedIn,
    isSubscribed,
    isLoading: isLoggedIn && isLoading,
  };
}
