import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond, Check } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    features: ["1,000 requests/day", "1 API key", "Community support"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    popular: true,
    features: [
      "50,000 requests/day",
      "10 API keys",
      "Email support",
      "Usage analytics",
    ],
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    features: [
      "Unlimited requests",
      "Unlimited API keys",
      "Dedicated support",
      "Usage analytics",
      "99.9% SLA",
      "Custom domain",
    ],
  },
];

const statusBadge: Record<string, { className: string; label: string }> = {
  active: { className: "bg-emerald-500/10 text-emerald-400", label: "Active" },
  trialing: { className: "bg-sky-500/10 text-sky-400", label: "Trial" },
  past_due: { className: "bg-amber-500/10 text-amber-400", label: "Past Due" },
  cancelled: { className: "bg-red-500/10 text-red-400", label: "Cancelled" },
};

export default function BillingPage() {
  const { subscription, loading, error, checkout } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const currentTier = subscription?.tier ?? "free";
  const badge = statusBadge[subscription?.status ?? "active"] ?? statusBadge.active;

  const handleUpgrade = async (tier: string) => {
    setUpgradeError(null);
    try {
      const url = await checkout(tier);
      window.location.href = url;
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Failed to start checkout");
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Billing" />
        <div className="space-y-6 animate-pulse">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
            <div className="h-6 bg-slate-800 rounded w-48 mb-4" />
            <div className="h-4 bg-slate-800 rounded w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-700 p-6 h-64" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Billing" />

      {(error || upgradeError) && (
        <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {upgradeError || error}
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Diamond className="text-emerald-400 w-5 h-5" />
              {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
            </h3>
            {subscription?.currentPeriodEnd && (
              <p className="text-slate-400 text-sm mt-1">
                Billing period ends{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  "en-US",
                  { month: "long", day: "numeric", year: "numeric" }
                )}
              </p>
            )}
          </div>
          <Badge className={badge.className}>{badge.label}</Badge>
        </div>
        {currentTier !== "free" && (
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Manage Subscription
            </Button>
            <Button className="bg-red-500/10 text-red-400 hover:bg-red-500/20">
              Cancel Plan
            </Button>
          </div>
        )}
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-800 rounded-lg p-1">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly — Save 20%
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrent = tier.name.toLowerCase() === currentTier;
          const price =
            billingCycle === "yearly" && tier.price !== "$0"
              ? `$${Math.round(parseInt(tier.price.slice(1)) * 0.8)}`
              : tier.price;

          return (
            <div
              key={tier.name}
              className={`bg-slate-900 rounded-xl border p-6 flex flex-col ${
                tier.popular
                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                  : "border-slate-700"
              }`}
            >
              {tier.popular && (
                <Badge className="bg-emerald-500/10 text-emerald-400 self-start mb-4">
                  Popular
                </Badge>
              )}
              <h3 className="text-white font-semibold text-lg">{tier.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">{price}</span>
                <span className="text-slate-400 text-sm">
                  {billingCycle === "yearly" ? "/yr" : tier.period}
                </span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${
                  isCurrent
                    ? "bg-slate-800 text-slate-400 cursor-default"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
                disabled={isCurrent}
                onClick={() => !isCurrent && handleUpgrade(tier.name.toLowerCase())}
              >
                {isCurrent ? "Current Plan" : "Upgrade"}
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
