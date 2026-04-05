import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { ApiKey, CreatedKey } from "@/lib/types";

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<ApiKey[]>("/api/api-keys");
      setKeys(data.filter((k) => !k.revokedAt));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = async (name: string): Promise<CreatedKey> => {
    const result = await api.post<CreatedKey>("/api/api-keys", { name });
    await fetchKeys();
    return result;
  };

  const revokeKey = async (id: string): Promise<void> => {
    await api.delete(`/api/api-keys/${id}`);
    await fetchKeys();
  };

  return { keys, loading, error, createKey, revokeKey, refetch: fetchKeys };
}
