import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Subscription } from "@/lib/types";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Subscription>("/api/subscriptions/me")
      .then(setSubscription)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load subscription");
      })
      .finally(() => setLoading(false));
  }, []);

  const checkout = async (tier: string): Promise<string> => {
    const { url } = await api.post<{ url: string }>("/api/subscriptions/checkout", { tier });
    return url;
  };

  return { subscription, loading, error, checkout };
}
