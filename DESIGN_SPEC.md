# Golden Template — Dashboard Design Specification

> **Author:** UX/UI Specialist  
> **Version:** 1.0  
> **Date:** 2026-04-04  
> **Target:** Frontend Developer hand-off  

---

## 1. Design Philosophy

This is a **developer-facing API product**. Every design decision optimizes for:

- **Speed to first API call** — minimize friction between signup and `curl`
- **Information density** — developers scan, they don't browse
- **Trust signals** — uptime, latency, and transparent pricing build confidence
- **Dark-first aesthetic** — matches terminal/IDE environments developers live in

Visual references: Vercel Dashboard, Stripe API Docs, Linear App.

---

## 2. Design System Tokens

### 2.1 Color Palette (Tailwind CSS)

```
Background layers:
  bg-slate-950        #020617   — Page background
  bg-slate-900        #0f172a   — Card / panel background
  bg-slate-800        #1e293b   — Elevated surface (modals, dropdowns)
  bg-slate-800/50     —          — Hover states on cards

Borders:
  border-slate-700    #334155   — Default border
  border-slate-600    #475569   — Active / focus border

Text:
  text-white          #ffffff   — Primary headings
  text-slate-200      #e2e8f0   — Body text
  text-slate-400      #94a3b8   — Secondary / muted text
  text-slate-500      #64748b   — Placeholder text

Accent (Primary — Emerald):
  text-emerald-400    #34d399   — Links, active states, success
  bg-emerald-500      #10b981   — Primary buttons
  bg-emerald-600      #059669   — Primary button hover
  ring-emerald-500/20 —          — Focus ring

Accent (Warning — Amber):
  text-amber-400      #fbbf24   — Warnings, expiring keys
  bg-amber-500/10     —          — Warning badge background

Accent (Danger — Red):
  text-red-400        #f87171   — Errors, revoke actions
  bg-red-500          #ef4444   — Destructive buttons
  bg-red-600          #dc2626   — Destructive button hover
  bg-red-500/10       —          — Error badge background

Accent (Info — Sky):
  text-sky-400        #38bdf8   — Info badges, tier labels
  bg-sky-500/10       —          — Info badge background

Code / Terminal:
  bg-slate-950        #020617   — Code block background
  text-emerald-300    #6ee7b7   — Code strings
  text-sky-300        #7dd3fc   — Code keywords
  text-slate-300      #cbd5e1   — Code default text
  text-purple-400     #c084fc   — Code numbers / constants
```

### 2.2 Typography

```
Font stack:
  --font-sans:  "Inter", ui-sans-serif, system-ui, sans-serif
  --font-mono:  "JetBrains Mono", "Fira Code", ui-monospace, monospace

Scale (Tailwind classes):
  text-3xl  font-bold    — Page titles (30px)
  text-xl   font-semibold — Section headings (20px)
  text-base font-medium  — Card titles (16px)
  text-sm                — Body text (14px)
  text-xs                — Labels, badges, timestamps (12px)

Line height:
  leading-tight   — Headings
  leading-relaxed — Body text
```

### 2.3 Spacing & Layout

```
Container:   max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
Card:        rounded-xl border border-slate-700 bg-slate-900 p-6
Card hover:  hover:border-slate-600 transition-colors
Sections:    space-y-8 (32px vertical rhythm)
Grid:        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

### 2.4 Shared Components

```
Button (Primary):
  bg-emerald-500 hover:bg-emerald-600 text-white font-medium
  px-4 py-2 rounded-lg transition-colors
  focus:outline-none focus:ring-2 focus:ring-emerald-500/20

Button (Secondary / Ghost):
  bg-transparent border border-slate-700 text-slate-200
  hover:bg-slate-800 hover:border-slate-600
  px-4 py-2 rounded-lg transition-colors

Button (Danger):
  bg-red-500/10 text-red-400 hover:bg-red-500/20
  px-4 py-2 rounded-lg transition-colors

Badge:
  inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
  Variants: emerald (active), amber (warning), red (error), sky (info), slate (neutral)

Input:
  bg-slate-950 border border-slate-700 text-white placeholder-slate-500
  rounded-lg px-3 py-2 text-sm
  focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20

Code Block:
  bg-slate-950 rounded-xl border border-slate-700 p-4 font-mono text-sm
  overflow-x-auto
  Header bar: bg-slate-900 px-4 py-2 rounded-t-xl border-b border-slate-700
    with 3 dot indicators (red, amber, emerald circles) and language label
```

---

## 3. Layout Architecture

### 3.1 App Shell

```
┌─────────────────────────────────────────────────────────────────┐
│  Top Nav Bar — fixed, h-16, bg-slate-900 border-b border-700   │
│  [Logo]           [Docs] [Dashboard]       [Avatar ▾]          │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                    │
│  Sidebar   │   Main Content Area                                │
│  w-64      │   max-w-6xl mx-auto                                │
│  bg-950    │                                                    │
│            │                                                    │
│  - Overview│                                                    │
│  - API Keys│                                                    │
│  - Usage   │                                                    │
│  - Billing │                                                    │
│  - Settings│                                                    │
│  - Docs ↗  │                                                    │
│            │                                                    │
├────────────┴────────────────────────────────────────────────────┤
│  (no footer in dashboard — clean exit)                          │
└─────────────────────────────────────────────────────────────────┘

Responsive:
  - lg+:  sidebar visible, main content shifts right
  - md:   sidebar collapses to icons (w-16) with tooltips
  - sm:   sidebar becomes a hamburger slide-over (Sheet component)
```

### 3.2 Navigation Sidebar

```
Component: <DashboardSidebar />

Structure:
  <nav class="flex flex-col h-full bg-slate-950 border-r border-slate-700">
    <!-- Logo area -->
    <div class="h-16 flex items-center px-4 border-b border-slate-700">
      <Logo /> <span class="text-white font-semibold ml-2">Golden API</span>
    </div>

    <!-- Nav items -->
    <div class="flex-1 py-4 space-y-1 px-3">
      <NavItem icon={LayoutDashboard} label="Overview"  href="/dashboard" />
      <NavItem icon={Key}             label="API Keys"  href="/dashboard/keys" />
      <NavItem icon={BarChart3}       label="Usage"     href="/dashboard/usage" />
      <NavItem icon={CreditCard}      label="Billing"   href="/dashboard/billing" />
      <NavItem icon={Settings}        label="Settings"  href="/dashboard/settings" />
      <Divider />
      <NavItem icon={BookOpen}        label="API Docs"  href="/reference" external />
    </div>

    <!-- User section at bottom -->
    <div class="border-t border-slate-700 p-4">
      <UserCard avatar={user.image} name={user.name} email={user.email} />
    </div>
  </nav>

NavItem states:
  Default:  text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg px-3 py-2
  Active:   text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2
```

---

## 4. Screen Designs

### 4.1 Login / Signup

**Route:** `/login`, `/signup`

**Layout:** Centered card on full-page `bg-slate-950` background. No sidebar.

```
┌──────────────────────────────────────────────┐
│                                              │
│              [Golden API Logo]               │
│          "Sign in to your account"           │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Email                                 │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │ you@example.com                  │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │  Password                              │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │ ••••••••                         │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │                                        │  │
│  │  [ ████  Sign In  ████████████████ ]   │  │
│  │                                        │  │
│  │  ─────────── or ───────────            │  │
│  │                                        │  │
│  │  [ ◉ Continue with GitHub            ] │  │
│  │                                        │  │
│  │  Don't have an account? Sign up        │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

**Component Hierarchy:**

```
<AuthLayout>                              — bg-slate-950 min-h-screen flex items-center justify-center
  <div class="w-full max-w-md">
    <Logo />                              — centered, mb-8
    <h1>                                  — text-2xl font-bold text-white text-center mb-2
    <p>                                   — text-slate-400 text-center mb-8
    <AuthCard>                            — bg-slate-900 rounded-xl border border-slate-700 p-8
      <EmailPasswordForm />              — Better-Auth email/password
        <Input label="Email" />
        <Input label="Password" type="password" />
        <Button primary full-width />
      <Divider text="or" />              — flex items-center, border-t with text-slate-500
      <OAuthButton provider="github" />  — Ghost button with GitHub icon
      <AuthSwitch />                     — text-sm text-slate-400, link in text-emerald-400
    </AuthCard>
  </div>
</AuthLayout>
```

**Signup variant:**
- Heading: "Create your account"
- Additional field: "Name" above Email
- CTA: "Create Account"
- Switch: "Already have an account? Sign in"

**Validation:** Inline errors below fields in `text-red-400 text-xs mt-1`.

---

### 4.2 Dashboard Overview

**Route:** `/dashboard`

**Purpose:** At-a-glance summary — current plan, key count, recent usage, quick actions.

```
┌─────────────────────────────────────────────────────────────┐
│  Overview                                                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Current Plan │  │  API Keys    │  │  Requests     │      │
│  │              │  │              │  │  (30d)        │      │
│  │  PRO         │  │  3 active    │  │  12,847       │      │
│  │  active ●    │  │              │  │  ▁▂▄▃▅▇▆▅    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  Quick Start                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  $ curl -H "Authorization: Bearer gk_live_..."      │   │
│  │         https://api.example.com/tasks               │   │
│  │                                              [Copy] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Recent Activity                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  gk_live_a3f...  GET /tasks         2ms   200  now  │   │
│  │  gk_live_a3f...  POST /tasks        5ms   201  2m   │   │
│  │  gk_live_b7c...  GET /tasks/12      1ms   200  5m   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**

```
<DashboardLayout>
  <PageHeader title="Overview" />

  <StatsGrid>                               — grid grid-cols-1 md:grid-cols-3 gap-6
    <StatCard
      label="Current Plan"
      value="Pro"
      badge={<Badge variant="emerald">Active</Badge>}
      icon={CreditCard}
      action={{ label: "Upgrade", href: "/dashboard/billing" }}
    />
    <StatCard
      label="API Keys"
      value="3 active"
      icon={Key}
      action={{ label: "Manage", href: "/dashboard/keys" }}
    />
    <StatCard
      label="Requests (30d)"
      value="12,847"
      icon={BarChart3}
      sparkline={<Sparkline data={usageData} />}   — tiny inline chart
    />
  </StatsGrid>

  <QuickStartBlock>                         — Code block component
    <CodeWindow
      title="Quick Start"
      language="bash"
      code={curlExample}
      copyButton
    />
  </QuickStartBlock>

  <RecentActivityTable>                     — Compact table, no pagination
    columns: [Key Prefix, Method + Path, Latency, Status, Time Ago]
    rows: last 10 requests
    Empty state: "No requests yet. Use your API key to get started."
  </RecentActivityTable>
</DashboardLayout>
```

**StatCard spec:**

```
<div class="bg-slate-900 rounded-xl border border-slate-700 p-6">
  <div class="flex items-center justify-between mb-4">
    <span class="text-slate-400 text-sm">{label}</span>
    <Icon class="text-slate-500 w-5 h-5" />
  </div>
  <div class="text-2xl font-bold text-white">{value}</div>
  <div class="mt-2">{badge or sparkline}</div>
</div>
```

---

### 4.3 API Keys Management

**Route:** `/dashboard/keys`

**API contract:**
- `GET /api/api-keys` → `Array<{ id, name, keyPrefix, expiresAt, lastUsedAt, revokedAt, createdAt }>`
- `POST /api/api-keys` → `{ id, name, key, keyPrefix, expiresAt, createdAt }` (key shown once)
- `DELETE /api/api-keys/{id}` → `{ message }`

```
┌─────────────────────────────────────────────────────────────┐
│  API Keys                                    [+ Create Key] │
│                                                              │
│  ⚠ Keep your API keys secure. They grant full access to     │
│    your account. Do not share them in public repositories.   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Name          Key             Last Used    Actions  │   │
│  │  ─────────────────────────────────────────────────── │   │
│  │  Production    gk_live_a3f...  2 hours ago  [Revoke] │   │
│  │  Development   gk_live_b7c...  5 days ago   [Revoke] │   │
│  │  CI/CD         gk_live_x9d...  never        [Revoke] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**

```
<DashboardLayout>
  <PageHeader title="API Keys" action={<Button onClick={openCreateModal}>+ Create Key</Button>} />

  <SecurityBanner />                        — bg-amber-500/10 border border-amber-500/20 rounded-lg p-4
                                              text-amber-400 text-sm, with ShieldAlert icon

  <ApiKeysTable>                            — bg-slate-900 rounded-xl border border-slate-700
    <TableHeader>                           — bg-slate-800/50 px-6 py-3
      columns: [Name, Key, Expires, Last Used, Actions]
    </TableHeader>
    <TableBody>
      <ApiKeyRow>
        name:      text-white font-medium
        keyPrefix: font-mono text-slate-300 "gk_live_a3f..." with copy icon
        expires:   text-slate-400 text-sm (amber if < 7 days)
        lastUsed:  text-slate-400 text-sm relative time
        actions:   <Button danger size="sm">Revoke</Button>
      </ApiKeyRow>
    </TableBody>
    <EmptyState>                            — when no keys exist
      icon: Key (large, text-slate-600)
      text: "No API keys yet"
      subtext: "Create your first key to start making requests"
      action: <Button primary>Create API Key</Button>
    </EmptyState>
  </ApiKeysTable>

  <!-- Create Key Modal -->
  <Modal title="Create API Key">           — bg-slate-800 rounded-xl border border-slate-700
    <Input label="Key Name" placeholder="e.g., Production" />
    <Input label="Expiration (optional)" type="date" />
    <Button primary full-width>Create Key</Button>
  </Modal>

  <!-- Key Created Success Modal -->
  <Modal title="API Key Created">
    <SuccessIcon />                         — emerald checkmark
    <p>"Your API key has been created. Copy it now — it won't be shown again."</p>
    <CodeCopyBlock value="gk_live_xxxxxxxxxxxxxxxxxxxx" />  — full key, monospace, one-click copy
    <Button primary full-width>Done</Button>
  </Modal>

  <!-- Revoke Confirmation Modal -->
  <ConfirmDialog
    title="Revoke API Key"
    description="This will immediately invalidate the key. Any requests using it will fail."
    confirmLabel="Revoke Key"
    variant="danger"
  />
</DashboardLayout>
```

---

### 4.4 Usage Metrics Dashboard

**Route:** `/dashboard/usage`

**Note:** The current API does not expose a usage/analytics endpoint. This design assumes a future `GET /api/usage` endpoint or client-side aggregation. The Frontend Developer should stub this with mock data until the backend adds it.

```
┌─────────────────────────────────────────────────────────────┐
│  Usage                                [7d ▾] [30d] [90d]   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Total Reqs  │  │  Avg Latency │  │  Error Rate  │      │
│  │  12,847      │  │  3.2ms       │  │  0.4%        │      │
│  │  ↑ 12%       │  │  ↓ 0.5ms     │  │  ↓ 0.1%      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  Request Volume                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │         ▓▓                                           │   │
│  │      ▓▓ ▓▓ ▓▓    ▓▓                                 │   │
│  │   ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓                             │   │
│  │  ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓ ▓▓                    │   │
│  │  ─────────────────────────────                       │   │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Requests by Endpoint                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  GET  /tasks         ████████████████████  8,241     │   │
│  │  POST /tasks         ██████                 2,105    │   │
│  │  GET  /tasks/{id}    ████                   1,892    │   │
│  │  DELETE /tasks/{id}  █                        609    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Response Status Distribution                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2xx  ████████████████████████████████████  95.2%    │   │
│  │  4xx  ████                                   4.4%    │   │
│  │  5xx  ▏                                      0.4%    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**

```
<DashboardLayout>
  <PageHeader title="Usage">
    <TimeRangeSelector options={["7d", "30d", "90d"]} />    — pill toggle group
  </PageHeader>

  <StatsGrid cols={3}>
    <MetricCard label="Total Requests" value="12,847" trend="+12%" trendUp />
    <MetricCard label="Avg Latency"    value="3.2ms"  trend="-0.5ms" trendUp />
    <MetricCard label="Error Rate"     value="0.4%"   trend="-0.1%" trendUp />
  </StatsGrid>

  <ChartCard title="Request Volume">       — bg-slate-900 rounded-xl border
    <BarChart                               — Use recharts or chart.js
      barColor="emerald-500"
      gridColor="slate-700"
      labelColor="slate-400"
    />
  </ChartCard>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartCard title="Requests by Endpoint">
      <HorizontalBarChart />                — Grouped by method+path
    </ChartCard>
    <ChartCard title="Response Status Distribution">
      <HorizontalBarChart />                — 2xx emerald, 4xx amber, 5xx red
    </ChartCard>
  </div>
</DashboardLayout>
```

**MetricCard with trend:**

```
<div class="bg-slate-900 rounded-xl border border-slate-700 p-6">
  <span class="text-slate-400 text-sm">{label}</span>
  <div class="flex items-end gap-2 mt-2">
    <span class="text-2xl font-bold text-white">{value}</span>
    <span class={trendUp ? "text-emerald-400" : "text-red-400"} + " text-sm font-medium">
      {trend}
    </span>
  </div>
</div>
```

**TimeRangeSelector:**

```
<div class="inline-flex bg-slate-800 rounded-lg p-1">
  {options.map(opt => (
    <button class={
      active ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
    } + " px-3 py-1 rounded-md text-sm font-medium transition-colors">
      {opt}
    </button>
  ))}
</div>
```

---

### 4.5 Billing Portal

**Route:** `/dashboard/billing`

**API contract:**
- `GET /api/subscriptions/me` → `{ id, tier, status, paymentProvider, currentPeriodEnd }`
- `POST /api/subscriptions/checkout` → `{ url }` (redirect to LemonSqueezy)

**Tiers:** `free`, `pro`, `enterprise`

```
┌─────────────────────────────────────────────────────────────┐
│  Billing                                                     │
│                                                              │
│  Current Plan                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ◆ Pro Plan                              ● Active    │   │
│  │  Your current billing period ends on May 4, 2026.    │   │
│  │                                                      │   │
│  │  [Manage Subscription]          [Cancel Plan]        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Plans                                                       │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │    FREE        │ │  ★ PRO         │ │  ENTERPRISE    │   │
│  │                │ │  (current)     │ │                │   │
│  │    $0/mo       │ │   $29/mo       │ │   $99/mo       │   │
│  │                │ │                │ │                │   │
│  │  ✓ 1,000 req/d│ │  ✓ 50,000 req/d│ │  ✓ Unlimited   │   │
│  │  ✓ 1 API key  │ │  ✓ 10 API keys │ │  ✓ Unlimited   │   │
│  │  ✓ Community   │ │  ✓ Email       │ │  ✓ Dedicated   │   │
│  │    support     │ │    support     │ │    support     │   │
│  │               │ │  ✓ Analytics   │ │  ✓ Analytics   │   │
│  │               │ │               │ │  ✓ SLA 99.9%   │   │
│  │               │ │               │ │  ✓ Custom       │   │
│  │               │ │               │ │    domain       │   │
│  │  [Current]    │ │  [Current ✓]  │ │  [Upgrade]     │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
│                                                              │
│  Billing toggle: [Monthly] [Yearly — Save 20%]              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**

```
<DashboardLayout>
  <PageHeader title="Billing" />

  <CurrentPlanCard>                         — bg-slate-900 rounded-xl border p-6
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-white font-semibold text-lg flex items-center gap-2">
          <Diamond class="text-emerald-400 w-5 h-5" /> Pro Plan
        </h3>
        <p class="text-slate-400 text-sm mt-1">
          Billing period ends {currentPeriodEnd}
        </p>
      </div>
      <Badge variant="emerald">{status}</Badge>     — active, trialing, past_due, cancelled
    </div>
    <div class="flex gap-3 mt-4">
      <Button secondary>Manage Subscription</Button>  — opens LemonSqueezy portal
      <Button danger>Cancel Plan</Button>
    </div>
  </CurrentPlanCard>

  <BillingToggle>                           — Monthly / Yearly toggle (pill style)
    <TimeRangeSelector options={["Monthly", "Yearly — Save 20%"]} />
  </BillingToggle>

  <PricingGrid>                             — grid grid-cols-1 md:grid-cols-3 gap-6
    <PricingCard
      name="Free"
      price="$0"
      period="/mo"
      features={["1,000 requests/day", "1 API key", "Community support"]}
      cta={{ label: "Current Plan", disabled: true }}       — if current
      cta={{ label: "Downgrade", variant: "secondary" }}    — if not current
    />
    <PricingCard
      name="Pro"
      price="$29"
      period="/mo"
      popular                               — adds ring-2 ring-emerald-500 and "Popular" badge
      features={["50,000 requests/day", "10 API keys", "Email support", "Usage analytics"]}
      cta={{ label: "Current Plan ✓", disabled: true }}
    />
    <PricingCard
      name="Enterprise"
      price="$99"
      period="/mo"
      features={["Unlimited requests", "Unlimited API keys", "Dedicated support", "Usage analytics", "99.9% SLA", "Custom domain"]}
      cta={{ label: "Upgrade", variant: "primary" }}
    />
  </PricingGrid>
</DashboardLayout>
```

**PricingCard spec:**

```
<div class={`
  bg-slate-900 rounded-xl border p-6 flex flex-col
  ${popular ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-700"}
`}>
  {popular && <Badge variant="emerald" class="self-start mb-4">Popular</Badge>}
  <h3 class="text-white font-semibold text-lg">{name}</h3>
  <div class="mt-4">
    <span class="text-4xl font-bold text-white">{price}</span>
    <span class="text-slate-400 text-sm">{period}</span>
  </div>
  <ul class="mt-6 space-y-3 flex-1">
    {features.map(f => (
      <li class="flex items-center gap-2 text-sm text-slate-300">
        <Check class="w-4 h-4 text-emerald-400 flex-shrink-0" />
        {f}
      </li>
    ))}
  </ul>
  <Button class="mt-8 w-full" variant={cta.variant}>{cta.label}</Button>
</div>
```

**Status badge variants:**

| Status     | Badge                                         |
|------------|-----------------------------------------------|
| `active`   | `bg-emerald-500/10 text-emerald-400` "Active" |
| `trialing` | `bg-sky-500/10 text-sky-400` "Trial"           |
| `past_due` | `bg-amber-500/10 text-amber-400` "Past Due"   |
| `cancelled`| `bg-red-500/10 text-red-400` "Cancelled"       |

---

### 4.6 Settings

**Route:** `/dashboard/settings`

```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                    │
│                                                              │
│  Profile                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Avatar   [ Upload ]                                 │   │
│  │  Name     [________________________]                 │   │
│  │  Email    [________________________]  (read-only)    │   │
│  │                                                      │   │
│  │                                [Save Changes]        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Connected Accounts                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ◉ GitHub    connected as @username    [Disconnect]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Danger Zone                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Delete Account                                      │   │
│  │  Permanently delete your account and all data.       │   │
│  │                              [Delete Account]        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Component Hierarchy:**

```
<DashboardLayout>
  <PageHeader title="Settings" />

  <SettingsSection title="Profile">
    <AvatarUpload />
    <Input label="Name" value={user.name} />
    <Input label="Email" value={user.email} disabled />
    <Button primary>Save Changes</Button>
  </SettingsSection>

  <SettingsSection title="Connected Accounts">
    <OAuthConnectionRow provider="GitHub" connected username="@user" />
  </SettingsSection>

  <SettingsSection title="Danger Zone" variant="danger">
    — border-red-500/20 bg-red-500/5 rounded-xl p-6
    <p class="text-slate-300 text-sm">Permanently delete your account and all data.</p>
    <Button danger>Delete Account</Button>
  </SettingsSection>
</DashboardLayout>
```

---

## 5. Landing Page (Public)

**Route:** `/` (root — before auth)

This is the **marketing/conversion page** for the API product.

### 5.1 Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│  Nav: [Golden API]                  [Docs] [Pricing] [Sign In] │
│─────────────────────────────────────────────────────────────────│
│                                                                  │
│         Ship APIs faster.                                        │
│         Production-ready in minutes, not months.                 │
│                                                                  │
│         [Get API Key — Free]    [Read the Docs →]                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ● ● ●  Terminal                                          │  │
│  │  $ curl -X GET https://api.golden.dev/tasks \             │  │
│  │       -H "Authorization: Bearer gk_live_abc123..."        │  │
│  │                                                           │  │
│  │  {                                                        │  │
│  │    "data": [                                              │  │
│  │      { "id": 1, "name": "Build something great" }        │  │
│  │    ]                                                      │  │
│  │  }                                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Background: `bg-slate-950` with subtle radial gradient (`bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950`)
- Headline: `text-5xl sm:text-6xl font-bold text-white tracking-tight`
- Subheading: `text-xl text-slate-400 max-w-2xl`
- Primary CTA: `bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg font-medium`
- Secondary CTA: `text-emerald-400 hover:text-emerald-300 font-medium`
- Code window: Full syntax-highlighted terminal with the shared CodeWindow component

### 5.2 Interactive API Docs Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│         Explore the API                                          │
│         Interactive documentation powered by OpenAPI 3.0         │
│                                                                  │
│         [Open API Reference →]                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────┐ ┌────────────────────────────────────────┐  │  │
│  │  │ Endpoints│ │  GET /tasks                            │  │  │
│  │  │          │ │                                        │  │  │
│  │  │ ▸ Auth   │ │  Try it out:                           │  │  │
│  │  │ ▾ Tasks  │ │  [Send Request]                        │  │  │
│  │  │   GET    │ │                                        │  │  │
│  │  │   POST   │ │  Response 200:                         │  │  │
│  │  │   PATCH  │ │  { ... }                               │  │  │
│  │  │   DELETE │ │                                        │  │  │
│  │  │ ▸ Keys  │ │                                        │  │  │
│  │  │ ▸ Subs  │ │                                        │  │  │
│  │  └──────────┘ └────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation note:** This section is a styled preview/screenshot linking to `/reference` (Scalar). The Scalar API reference is already configured with the `kepler` theme. Embed it in an `<iframe>` or simply link to it with a compelling visual preview.

### 5.3 Use Cases

```
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │  🔧 SaaS Backend │  │  📱 Mobile App   │  │  🤖 Automation   │
  │                  │  │                  │  │                  │
  │  Drop-in REST    │  │  Authenticate    │  │  Integrate with  │
  │  API with auth,  │  │  users, manage   │  │  CI/CD, cron     │
  │  billing, and    │  │  subscriptions,  │  │  jobs, and       │
  │  rate limiting   │  │  and track usage │  │  webhooks via    │
  │  out of the box. │  │  from any client.│  │  API keys.       │
  │                  │  │                  │  │                  │
  │  [Learn More →]  │  │  [Learn More →]  │  │  [Learn More →]  │
  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Specs:**

```
<section class="py-24 bg-slate-950">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-3xl font-bold text-white text-center mb-4">What you can build</h2>
    <p class="text-slate-400 text-center mb-12 max-w-xl mx-auto">
      A production-ready API foundation for any product.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UseCaseCard
        icon={Wrench}                       — text-emerald-400 w-8 h-8
        title="SaaS Backend"
        description="Drop-in REST API with auth, billing, and rate limiting out of the box."
      />
      <UseCaseCard icon={Smartphone} ... />
      <UseCaseCard icon={Bot} ... />
    </div>
  </div>
</section>
```

**UseCaseCard:**

```
<div class="bg-slate-900 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
  <Icon class="text-emerald-400 w-8 h-8 mb-4" />
  <h3 class="text-white font-semibold text-lg mb-2">{title}</h3>
  <p class="text-slate-400 text-sm leading-relaxed">{description}</p>
</div>
```

### 5.4 Pricing Table (Public)

Same `PricingGrid` component as Section 4.5, but:
- CTA for all tiers is "Get Started" → links to `/signup`
- No "Current Plan" state
- Add section heading: "Simple, transparent pricing"
- Add subheading: "Start free. Upgrade when you need to."
- Billing toggle for Monthly / Yearly

---

## 6. Component Index

| Component             | Location Suggestion              | Used In                    |
|-----------------------|----------------------------------|----------------------------|
| `AuthLayout`          | `components/layouts/`            | Login, Signup              |
| `DashboardLayout`     | `components/layouts/`            | All dashboard pages        |
| `DashboardSidebar`    | `components/navigation/`         | DashboardLayout            |
| `PageHeader`          | `components/ui/`                 | All dashboard pages        |
| `StatCard`            | `components/dashboard/`          | Overview                   |
| `MetricCard`          | `components/dashboard/`          | Usage                      |
| `CodeWindow`          | `components/ui/`                 | Landing Hero, Overview     |
| `ApiKeysTable`        | `components/dashboard/`          | API Keys page              |
| `PricingCard`         | `components/billing/`            | Billing, Landing           |
| `PricingGrid`         | `components/billing/`            | Billing, Landing           |
| `CurrentPlanCard`     | `components/billing/`            | Billing                    |
| `Badge`               | `components/ui/`                 | Everywhere                 |
| `Button`              | `components/ui/`                 | Everywhere                 |
| `Input`               | `components/ui/`                 | Auth, Settings, Modals     |
| `Modal`               | `components/ui/`                 | API Keys, confirmations    |
| `ConfirmDialog`       | `components/ui/`                 | Revoke, Delete             |
| `TimeRangeSelector`   | `components/ui/`                 | Usage, Billing             |
| `UseCaseCard`         | `components/landing/`            | Landing page               |
| `SecurityBanner`      | `components/ui/`                 | API Keys page              |
| `Sparkline`           | `components/charts/`             | Overview StatCard          |
| `BarChart`            | `components/charts/`             | Usage page                 |
| `HorizontalBarChart`  | `components/charts/`             | Usage page                 |

---

## 7. Responsive Breakpoints

| Breakpoint | Width    | Behavior                                        |
|------------|----------|-------------------------------------------------|
| `sm`       | 640px+   | Single column, full-width cards                 |
| `md`       | 768px+   | 2-column grids, collapsed sidebar (icons only)  |
| `lg`       | 1024px+  | 3-column grids, full sidebar                    |
| `xl`       | 1280px+  | Max container width, comfortable spacing        |

---

## 8. Accessibility Requirements

- All interactive elements must be keyboard-navigable
- Focus states: `focus:outline-none focus:ring-2 focus:ring-emerald-500/20`
- Minimum contrast ratio 4.5:1 for body text (slate-200 on slate-950 = 13.5:1 ✓)
- All icons must have `aria-label` or be decorative (`aria-hidden="true"`)
- Modals must trap focus and support `Escape` to close
- Toast notifications for async actions (key created, key revoked) with `role="alert"`
- `prefers-reduced-motion` — disable sparkline/chart animations

---

## 9. Recommended Frontend Stack

Since the backend is Hono on Cloudflare Workers, the frontend should be:

| Concern        | Recommendation                        | Why                                     |
|----------------|---------------------------------------|-----------------------------------------|
| Framework      | **React** (via Vite or Next.js)       | Component model matches this spec       |
| Styling        | **Tailwind CSS v4**                   | Matches all design tokens above         |
| Components     | **shadcn/ui** (dark theme)            | Prebuilt accessible primitives          |
| Charts         | **Recharts** or **Tremor**            | React-native charting for usage page    |
| Icons          | **Lucide React**                      | Referenced throughout this spec         |
| Code Highlight | **Shiki** or **Prism**                | Terminal/code block syntax highlighting |
| Forms          | **React Hook Form + Zod**             | Matches backend Zod schemas             |
| HTTP Client    | **ky** or **ofetch**                  | Lightweight, works with Bearer auth     |

---

## 10. Implementation Priority

1. **Auth screens** (Login / Signup) — gate for everything else
2. **Dashboard shell** (Layout + Sidebar + Navigation)
3. **API Keys page** — most critical developer workflow
4. **Overview page** — landing after login
5. **Billing page** — monetization
6. **Usage page** — requires backend analytics endpoint
7. **Settings page** — lowest priority
8. **Landing page** — public marketing, can ship after dashboard
