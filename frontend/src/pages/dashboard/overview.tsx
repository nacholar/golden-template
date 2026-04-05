import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { CreditCard, Key, BarChart3, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";

interface Subscription {
  tier: string;
  status: string;
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  badge,
  action,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  badge?: { text: string; variant: string };
  action?: { label: string; href: string };
}) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm">{label}</span>
        <Icon className="text-slate-500 w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-2 flex items-center justify-between">
        {badge && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
              badge.variant === "emerald"
                ? "bg-emerald-500/10 text-emerald-400"
                : badge.variant === "sky"
                  ? "bg-sky-500/10 text-sky-400"
                  : "bg-slate-800 text-slate-400"
            }`}
          >
            {badge.text}
          </span>
        )}
        {action && (
          <Link
            to={action.href}
            className="text-emerald-400 hover:text-emerald-300 text-xs font-medium"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

function CodeWindow({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          <span className="text-slate-500 text-xs ml-2">Terminal</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-400 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <pre className="p-4 font-mono text-sm overflow-x-auto">
        <code className="text-slate-300">{code}</code>
      </pre>
    </div>
  );
}

export default function OverviewPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    api.get<Subscription>("/api/subscriptions/me").then(setSubscription).catch(() => {});
    api.get<ApiKey[]>("/api/api-keys").then(setKeys).catch(() => {});
  }, []);

  const tier = subscription?.tier ?? "free";
  const keyCount = keys.length;
  const firstKeyPrefix = keys[0]?.keyPrefix ?? "gk_live_...";

  const curlExample = `curl -X GET https://api.golden.dev/tasks \\
  -H "Authorization: Bearer ${firstKeyPrefix}..."`;

  return (
    <>
      <PageHeader title="Overview" />

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
