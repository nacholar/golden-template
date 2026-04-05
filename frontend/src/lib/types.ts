export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  tier: string;
  status: string;
  paymentProvider: string;
  currentPeriodEnd: string | null;
}

export interface CreatedKey {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
}
