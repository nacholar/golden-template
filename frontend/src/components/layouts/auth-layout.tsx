import type { ReactNode } from "react";
import { Hexagon } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Hexagon className="w-10 h-10 text-emerald-400 mb-4" />
          <span className="text-white font-semibold text-xl">Golden API</span>
        </div>
        {children}
      </div>
    </div>
  );
}
