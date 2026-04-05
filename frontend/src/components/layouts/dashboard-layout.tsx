import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/navigation/dashboard-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />
        <span className="sr-only">Loading dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed w-64 h-full">
          <DashboardSidebar />
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-slate-900 border-b border-slate-700 flex items-center px-4">
          <SheetTrigger aria-label="Open navigation menu" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Menu className="w-5 h-5" />
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-slate-700">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main id="main-content" className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8 mt-16 lg:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
