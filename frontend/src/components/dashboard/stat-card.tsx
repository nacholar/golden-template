import { Link } from "react-router-dom";

export function StatCard({
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
