import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Hexagon,
  Wrench,
  Smartphone,
  Bot,
  Check,
  Copy,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

const useCases = [
  {
    icon: Wrench,
    title: "SaaS Backend",
    description:
      "Drop-in REST API with auth, billing, and rate limiting out of the box.",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description:
      "Authenticate users, manage subscriptions, and track usage from any client.",
  },
  {
    icon: Bot,
    title: "Automation",
    description:
      "Integrate with CI/CD, cron jobs, and webhooks via API keys.",
  },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    features: ["1,000 requests/day", "1 API key", "Community support"],
  },
  {
    name: "Pro",
    price: "$29",
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

function CodeWindow() {
  const [copied, setCopied] = useState(false);
  const code = `$ curl -X GET https://api.golden.dev/tasks \\
     -H "Authorization: Bearer gk_live_abc123..."

{
  "data": [
    { "id": 1, "name": "Build something great" }
  ]
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden max-w-3xl mx-auto">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          <span className="text-slate-500 text-xs ml-2">Terminal</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <pre className="p-6 font-mono text-sm overflow-x-auto leading-relaxed">
        <code>
          <span className="text-slate-500">$ </span>
          <span className="text-sky-300">curl</span>
          <span className="text-slate-300"> -X GET </span>
          <span className="text-emerald-300">https://api.golden.dev/tasks</span>
          <span className="text-slate-500"> \</span>
          {"\n     "}
          <span className="text-slate-300">-H </span>
          <span className="text-emerald-300">"Authorization: Bearer gk_live_abc123..."</span>
          {"\n\n"}
          <span className="text-slate-500">{"{"}</span>
          {"\n  "}
          <span className="text-sky-300">"data"</span>
          <span className="text-slate-300">: [</span>
          {"\n    "}
          <span className="text-slate-500">{"{"} </span>
          <span className="text-sky-300">"id"</span>
          <span className="text-slate-300">: </span>
          <span className="text-purple-400">1</span>
          <span className="text-slate-300">, </span>
          <span className="text-sky-300">"name"</span>
          <span className="text-slate-300">: </span>
          <span className="text-emerald-300">"Build something great"</span>
          <span className="text-slate-500"> {"}"}</span>
          {"\n  "}
          <span className="text-slate-300">]</span>
          {"\n"}
          <span className="text-slate-500">{"}"}</span>
        </code>
      </pre>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav aria-label="Main navigation" className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-emerald-400" />
            <span className="text-white font-semibold">Golden API</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="/reference"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden sm:block"
            >
              Docs
            </a>
            <a
              href="#pricing"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden sm:block"
            >
              Pricing
            </a>
            <Link to="/login">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="main-content" className="pt-32 pb-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6">
            Ship APIs faster.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Production-ready in minutes, not months. Auth, billing, rate
            limiting, and API keys out of the box.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link to="/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 text-lg font-medium h-auto">
                Get API Key — Free
              </Button>
            </Link>
            <a
              href="/reference"
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              Read the Docs <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <CodeWindow />
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            What you can build
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            A production-ready API foundation for any product.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-slate-900 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors"
              >
                <uc.icon className="text-emerald-400 w-8 h-8 mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">
                  {uc.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Start free. Upgrade when you need to.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-slate-900 rounded-xl border p-6 flex flex-col ${
                  tier.popular
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-700"
                }`}
              >
                {tier.popular && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 self-start mb-4">
                    Popular
                  </span>
                )}
                <h3 className="text-white font-semibold text-lg">{tier.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {tier.price}
                  </span>
                  <span className="text-slate-400 text-sm">/mo</span>
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
                <Link to="/signup" className="mt-8">
                  <Button
                    className={`w-full ${
                      tier.popular
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-400 text-sm">Golden API</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built with Golden Template
          </p>
        </div>
      </footer>
    </div>
  );
}
