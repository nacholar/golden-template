import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { GithubIcon } from "@/components/ui/icons";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL ?? "";

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Create your account
      </h1>
      <p className="text-slate-400 text-center mb-8">
        Get started with Golden API
      </p>
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          <div>
            <label className="text-sm text-slate-200 block mb-1.5">Name</label>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-200 block mb-1.5">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-200 block mb-1.5">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
