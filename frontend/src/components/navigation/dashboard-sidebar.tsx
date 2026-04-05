import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  CreditCard,
  Settings,
  BookOpen,
  Hexagon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Key, label: "API Keys", href: "/dashboard/keys" },
  { icon: BarChart3, label: "Usage", href: "/dashboard/usage" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav
      aria-label="Dashboard navigation"
      className={cn(
        "flex flex-col h-full bg-slate-950 border-r border-slate-700",
        className
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Hexagon className="w-6 h-6 text-emerald-400" />
          <span className="text-white font-semibold">Golden API</span>
        </Link>
      </div>

      <div className="flex-1 py-4 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="border-t border-slate-700 my-3" />
        <a
          href="/reference"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 ml-auto" />
        </a>
      </div>

      {user && (
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              className="text-slate-400 hover:text-white h-8 w-8"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
