import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const mockDaily = [
  { day: "Mon", requests: 1842 },
  { day: "Tue", requests: 2105 },
  { day: "Wed", requests: 2847 },
  { day: "Thu", requests: 2204 },
  { day: "Fri", requests: 1956 },
  { day: "Sat", requests: 893 },
  { day: "Sun", requests: 1000 },
];

const mockEndpoints = [
  { endpoint: "GET /tasks", count: 8241 },
  { endpoint: "POST /tasks", count: 2105 },
  { endpoint: "GET /tasks/:id", count: 1892 },
  { endpoint: "DELETE /tasks/:id", count: 609 },
];

const mockStatus = [
  { status: "2xx", count: 95.2, color: "#10b981" },
  { status: "4xx", count: 4.4, color: "#fbbf24" },
  { status: "5xx", count: 0.4, color: "#f87171" },
];

function MetricCard({
  label,
  value,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
      <span className="text-slate-400 text-sm">{label}</span>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span
          className={`text-sm font-medium ${trendUp ? "text-emerald-400" : "text-red-400"}`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}

export default function UsagePage() {
  const [range, setRange] = useState("7d");
  const ranges = ["7d", "30d", "90d"];

  return (
    <>
      <PageHeader title="Usage">
        <div className="inline-flex bg-slate-800 rounded-lg p-1">
          {ranges.map((r) => (
            <button
              key={r}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                range === r
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard label="Total Requests" value="12,847" trend="+12%" trendUp />
        <MetricCard label="Avg Latency" value="3.2ms" trend="-0.5ms" trendUp />
        <MetricCard label="Error Rate" value="0.4%" trend="-0.1%" trendUp />
      </div>

      {/* Request Volume Chart */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4">Request Volume</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Endpoint */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">Requests by Endpoint</h3>
          <div className="space-y-4">
            {mockEndpoints.map((ep) => {
              const maxCount = mockEndpoints[0].count;
              const pct = (ep.count / maxCount) * 100;
              return (
                <div key={ep.endpoint}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-mono text-slate-300">{ep.endpoint}</span>
                    <span className="text-slate-400">
                      {ep.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Response Status Distribution */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">
            Response Status Distribution
          </h3>
          <div className="space-y-4">
            {mockStatus.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{s.status}</span>
                  <span className="text-slate-400">{s.count}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.count}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
