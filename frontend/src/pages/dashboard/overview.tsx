import { PageHeader } from "@/components/ui/page-header";
import { CreditCard, Key, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { CodeWindow } from "@/components/dashboard/code-window";
import { useSubscription } from "@/hooks/use-subscription";
import { useApiKeys } from "@/hooks/use-api-keys";

export default function OverviewPage() {
  const { subscription, loading: subLoading, error: subError } = useSubscription();
  const { keys, loading: keysLoading, error: keysError } = useApiKeys();

  const tier = subscription?.tier ?? "free";
  const keyCount = keys.length;
  const firstKeyPrefix = keys[0]?.keyPrefix ?? "gk_live_...";

  const curlExample = `curl -X GET https://api.golden.dev/tasks \\
  -H "Authorization: Bearer ${firstKeyPrefix}..."`;

  const loading = subLoading || keysLoading;
  const error = subError || keysError;

  return (
    <>
      <PageHeader title="Overview" />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-700 p-6 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-24 mb-4" />
              <div className="h-8 bg-slate-800 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Current Plan"
            value={tier.charAt(0).toUpperCase() + tier.slice(1)}
            icon={CreditCard}
            badge={{
              text: subscription?.status === "active" ? "Active" : "Free",
              variant: "emerald",
            }}
            action={{ label: "Upgrade", href: "/dashboard/billing" }}
          />
          <StatCard
            label="API Keys"
            value={`${keyCount} active`}
            icon={Key}
            action={{ label: "Manage", href: "/dashboard/keys" }}
          />
          <StatCard
            label="Requests (30d)"
            value="--"
            icon={BarChart3}
            badge={{ text: "Analytics coming soon", variant: "sky" }}
          />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Start</h2>
        <CodeWindow code={curlExample} />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 text-center">
          <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No requests yet.</p>
          <p className="text-slate-500 text-xs mt-1">
            Use your API key to get started.
          </p>
        </div>
      </div>
    </>
  );
}
