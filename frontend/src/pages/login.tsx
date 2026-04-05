import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { GithubIcon } from "@/components/ui/icons";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL ?? "";

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Sign in to your account
      </h1>
      <p className="text-slate-400 text-center mb-8">
        Access your API dashboard
      </p>
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-400 text-xs" role="alert">{error}</p>
          )}
          <div>
            <label htmlFor="login-email" className="text-sm text-slate-200 block mb-1.5">Email</label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-sm text-slate-200 block mb-1.5">Password</label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              required
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-700" />
          <span className="px-3 text-slate-500 text-sm">or</span>
          <div className="flex-1 border-t border-slate-700" />
        </div>

        <a href={`${API_BASE}/api/auth/sign-in/social?provider=github`}>
          <Button
            variant="outline"
            className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
          >
            <GithubIcon className="w-4 h-4 mr-2" />
            Continue with GitHub
          </Button>
        </a>

        <p className="text-sm text-slate-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-emerald-400 hover:text-emerald-300">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
