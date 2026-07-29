# Novu — Frontend

Next.js app for **Novu**, a Spanish-language appointment-booking SaaS for service
businesses (barbershops, salons, aesthetics, clinics, gyms) in Uruguay / LatAm.

> Keep this file current. When you change routing, contexts, plan gating, or theming
> conventions, update the matching section **in the same commit**. A stale map is worse
> than none.

---

## Repo topology

This repo is **one of two independent repos** that deploy separately:

| Repo | Deploys to | Branch |
|---|---|---|
| `agenda-frontend` (this one) | Vercel | `master` |
| `agenda-backend` | Railway | `master` |

Their shared parent folder is **not** a git repository. There is no cross-repo commit —
a change spanning both is **two commits, two pushes**.

⚠️ **Pushing to `master` deploys to production immediately.** No staging gate.

```
Cloudflare (DNS) → Vercel (this app) → Railway (Express API) → Neon (Postgres)
```

The API base URL comes from `NEXT_PUBLIC_API_URL`.

---

## Three distinct surfaces

| Surface | Audience | Routes | Auth |
|---|---|---|---|
| **Dashboard** | Business owner + employees | `/dashboard/*` | JWT required |
| **Public page** | The business's own customers | `/public/[slug]` | none |
| **Marketing** | Prospects | `/`, `/features/*`, `/blog/*`, legal | none |

---

## Stack & layout

**Next.js 16 App Router**, React 19, TypeScript.
`axios` · `@fullcalendar/*` · `recharts` · `lucide-react` · `@headlessui/react` ·
`@react-oauth/google` · `xlsx` + `jspdf` + `html-to-image` (exports)

```
src/
├── app/          ← App Router; folder = URL segment
├── components/   ← landing/ public/ auth/ legal/ about/ contact/ onboarding/ + shared
├── context/      ← AuthContext, BusinessContext, ThemeContext
├── lib/api.ts    ← the ONLY axios instance
└── styles/       ← system.css dashboard.css landing.css public.css auth.css legal.css …
```

⚠️ **No CSS framework in the app shell.** Styling is hand-written CSS in `src/styles/*.css`
plus inline styles. Tailwind classes appear *only* on `<body>` in `app/layout.tsx`.
**Do not assume Tailwind is available inside components.**

---

## Route map

| Area | Paths |
|---|---|
| Marketing | `/`, `/features` + `/features/{reservas,recordatorios,pagos,metricas}`, `/blog` + `/blog/[slug]`, `/about`, `/contact`, `/help`, `/status`, `/changelog`, `/integraciones` |
| Legal | `/privacy`, `/terms` |
| Auth | `/login`, `/register`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` |
| Dashboard | `/dashboard` (calendar), `/appointments`, `/services`, `/schedules`, `/analytics`, `/team` (+`/modalities`, `/reports`), `/finances/{expenses,commissions}`, `/landing`, `/integraciones`, `/settings` (+`/billing`) |
| Public | `/public/[slug]`, `/public/[slug]/book`, `/public/payment/{success,failure}`, `/cancelar` |

---

## API layer

`src/lib/api.ts` is the **only** axios instance. Import it as `@/lib/api` — never create
another instance or call `fetch` against the API directly.

```ts
baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api`
```

A request interceptor attaches `Authorization: Bearer <token>` from `localStorage`,
guarded by `typeof window !== 'undefined'` so it is SSR-safe.

---

## Contexts

- **`AuthContext`** — JWT in `localStorage`; exposes `role`, `permissions`,
  `planSuspended`, `planBlocked`, `token`, `logout`.
- **`BusinessContext`** — current business, `featureFlags`, onboarding progress,
  `updateBusiness`.
- **`ThemeContext`** — dark/light toggle.

### Permissions

Employee permissions are a **jsonb** map from the API. Keys in use: `analytics`,
`settings`. Owners bypass all checks:

```ts
const canAnalytics = isOwner || !!permissions.analytics;
```

---

## Plans & feature flags ⚠️

Plans: **`gratis` · `pro` · `negocio`**.

```ts
FeatureFlags = { showModalities, showExpenses, showCommissions, showTeamReports }
```

Seeded from `TYPE_PRESETS[business_type]`, stored in `businesses.feature_flags`.

⚠️ `resolveFlags()` in `BusinessContext.tsx` **force-disables** `showModalities`,
`showExpenses`, `showCommissions`, `showTeamReports` for non-Pro plans regardless of the
stored value.

⚠️ **Feature flags shape the UI; they are not an entitlement check.** The API is the
authority (`requirePlan` server-side). Never treat a hidden control as a security
boundary — assume anyone can call the endpoint directly.

⚠️ A business can read `subscription_plan = 'pro'` and still be **effectively free**
(payment pending, or `subscription_ends_at` in the past). Mirror the server's rule:
`status === 'pending'` → free; expired → free.

**Free-plan analytics:** shows **only** Total citas + Ingresos totales. All Pro sections
are **removed from the DOM** (`{isPro && …}`), not blurred or lock-overlaid — that is an
explicit product decision, not an oversight. Don't "restore" them as locked teasers.

---

## Server vs Client Components ⚠️

Pages exporting `metadata` are **Server Components** and cannot receive event handlers.
`/blog` hit exactly this (`onMouseEnter` → build failure) and was fixed with a
`.blog-card:hover` CSS rule rather than by adding `'use client'`.

**Prefer CSS for hover/visual interactivity** so pages keep their SEO metadata. Reach for
`'use client'` only when you need real state or effects.

Client components using `useSearchParams` must be wrapped in `<Suspense>` (see
`app/verify-email/page.tsx`).

Dynamic route `params` are **async** in this Next.js version:
`params: Promise<{ slug: string }>`.

---

## Theming ⚠️

Dark is the default; light is an override applied as **`data-theme="light"`** on the root.
An inline anti-FOUC script in `app/layout.tsx` reads `localStorage.theme` before paint —
don't move it into a component.

Every themed surface needs **both** rules:

```css
.event-popup                      { background: oklch(0.18 0.04 280); }
[data-theme="light"] .event-popup { background: #fff; border-color: rgba(0,0,0,.1); }
```

⚠️ **Popups and dropdowns must use a solid background.** `var(--glass-bg-strong)` is
semi-transparent and made overlays unreadable — this bug recurred three times (topbar
notifications, calendar event popup, professional/service select). Prefer a CSS class
over inline styles so the light-mode override can reach it.

---

## Analytics / tracking

Microsoft Clarity is injected **inline in `<head>`** via `dangerouslySetInnerHTML` in
`app/layout.tsx`.

⚠️ It was tried with `next/script` first and **did not fire reliably in production**.
Do not "modernize" it back. The project id being visible in the client bundle is normal
for this class of tool.

---

## Security headers & CSP (`next.config.ts`) ⚠️

`headers()` applies a CSP plus `X-Frame-Options: DENY`, `nosniff`,
`Referrer-Policy`, HSTS, and `Permissions-Policy` to **every** route. `helmet()` in the
backend only covers API JSON responses — it never touched the HTML Vercel serves, which
is what these headers protect.

Third-party domains are an **explicit allowlist**, not a blanket `https:`: Clarity,
Google (OAuth + Maps + Fonts), Fontshare (loaded by an `@import` in `system.css`), and
Mercado Pago. **Adding a new third-party script, iframe, font, or API call requires
adding its domain here** — otherwise the browser silently blocks it. That is the single
most likely way this file breaks a feature.

⚠️ **`connect-src` is baked at build time from `NEXT_PUBLIC_API_URL`.** If that variable
is missing or wrong in Vercel, the CSP pins `connect-src` to `localhost` and **every API
call fails in production**. It is now a second failure mode for that variable, not just
a wrong base URL.

⚠️ `frame-ancestors 'none'` + `X-Frame-Options: DENY` block embedding anywhere. If
businesses should ever be able to embed their booking page in their own site, those two
lines are what to relax — and only for `/public/*`.

`'unsafe-inline' 'unsafe-eval'` in `script-src` is a known App Router concession
(hydration injects inline scripts without nonces in this setup). The real protection is
the third-party allowlist, `object-src 'none'`, and `frame-ancestors`.

**Never add a CSP change blind** — build, serve, and confirm with
`curl -D - -o /dev/null <url>` plus a real browser pass over login (Google OAuth popup)
and a public booking page.

---

## Security rules (follow these)

- **Never commit `.env*`** — `.gitignore` covers it. Values live in Vercel.
- ⚠️ **Only `NEXT_PUBLIC_*` vars are safe in this app.** Every `NEXT_PUBLIC_*` value is
  embedded in the client bundle and readable by anyone. Never put a secret, API key with
  write scope, or credential behind that prefix.
- **Never log the JWT** and never place it in a URL, query string, or analytics event.
- **Never render user-supplied HTML** with `dangerouslySetInnerHTML`. Its only sanctioned
  uses are the two first-party inline scripts in `app/layout.tsx` (theme + Clarity).
- **Treat all API data as untrusted** for rendering purposes, including business-owned
  public-page content (`tagline`, `lede`, reviews, FAQs) — it is authored by users.
- **Validate at the boundary in both layers.** Client-side checks are UX; the server
  repeats them. Do the client check anyway — it prevents malformed requests.

---

## Gotchas

| # | Trap |
|---|---|
| 1 | Two separate repos; branch `master`; push = production deploy |
| 2 | No Tailwind inside components — hand-written CSS only |
| 3 | Pages with `metadata` are Server Components — no event handlers |
| 4 | Dropdowns/popups need solid bg + `[data-theme="light"]` override |
| 5 | Clarity must stay inline in `<head>`, not `next/script` |
| 6 | Feature flags are cosmetic; the API is the real gate |
| 7 | `subscription_plan` ≠ effective plan (pending/expired → free) |
| 8 | Free-plan Pro sections are removed from the DOM, by design |
| 9 | Dynamic route `params` are a Promise (async) |
| 10 | `useSearchParams` needs a `<Suspense>` boundary |
| 11 | New third-party script/iframe/font/API needs its domain in the CSP allowlist |
| 12 | `NEXT_PUBLIC_API_URL` missing in Vercel now also breaks CSP `connect-src` |

**Reference case — the `employee_id` bug.** `components/public/PLReserveModal.tsx` fell
back to `employees[0]?.id`; when a service had no employees assigned the array was empty →
`undefined` → the API received `null` → NOT NULL violation in production. Fixed on both
sides: the modal now blocks submit with a user-facing message, and the API 400s on missing
fields. **Pattern to copy: validate at the boundary in both layers.**

---

## Task recipes

**Add a dashboard page** → `src/app/dashboard/<name>/page.tsx`; gate with `role` /
`permissions` from `useAuth()`; data via `@/lib/api`.

**Add a public-page section** → component in `src/components/public/` (`PL*` prefix);
styles in `src/styles/public.css`; wire into `PublicLanding.tsx`.

**Gate a feature behind Pro** → hide with `featureFlags` / `isPro` **and** confirm the
API enforces `requirePlan`. UI hiding alone is not a control.

**Change public booking** → `components/public/PLReserveModal.tsx`, paired with
`publicController.js::createAppointment` in the backend repo.

**Debug production** → Vercel logs (this app) · Railway logs (API) · Clarity (session
replay) · browser console.

---

## Not covered here

Open the source for: onboarding wizard steps (`components/onboarding/`) · per-component
styling · calendar configuration (`app/dashboard/page.tsx`, FullCalendar) · chart setup
(`app/dashboard/analytics/page.tsx`, Recharts) · export logic (xlsx / jspdf).
