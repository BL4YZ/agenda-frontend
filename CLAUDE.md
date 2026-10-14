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

## Four distinct surfaces

| Surface | Audience | Routes | Auth |
|---|---|---|---|
| **Dashboard** | Business owner + employees | `/dashboard/*` | JWT required |
| **Public page** | The business's own customers | `/public/[slug]` | none |
| **Page builder** | Business owner | `/editor`, `/editor/preview` | JWT required |
| **Marketing** | Prospects | `/`, `/features/*`, `/blog/*`, legal | none |

---

## Stack & layout

**Next.js 16 App Router**, React 19, TypeScript.
`axios` · `@fullcalendar/*` · `recharts` · `lucide-react` · `@headlessui/react` ·
`@react-oauth/google` · `xlsx` + `jspdf` + `html-to-image` (exports)

```
src/
├── app/          ← App Router; folder = URL segment
├── components/   ← landing/ public/ public/blocks/ builder/ auth/ legal/ about/
│                 contact/ onboarding/ + shared
├── context/      ← AuthContext, BusinessContext, ThemeContext
├── lib/api.ts    ← the ONLY axios instance
├── lib/builder/  ← page-builder model: blocks.ts design.ts runtime.ts templates.ts
└── styles/       ← system.css dashboard.css landing.css public.css builder.css
                  studio.css auth.css legal.css …
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
| Page builder | `/editor` (studio), `/editor/preview` (iframe target) — **outside `/dashboard` on purpose**: the dashboard layout's sidebar would eat the canvas, and a nested route cannot escape its parent layout |

---

## The page builder ⚠️

A business's public page is a **JSON document**, not a fixed component tree. The document
lives in `business_pages` (backend) as a **draft/published pair**, and only
`published_doc` is ever served to visitors.

```
types/builder.ts        ← the document model
lib/builder/blocks.ts   ← block registry: catalog + inspector controls + defaults
lib/builder/design.ts   ← design tokens → CSS custom properties
lib/builder/runtime.ts  ← helpers every block shares (safeUrl, sectionCss, videoEmbed…)
lib/builder/templates.ts← starter docs + docFromLegacy()
components/public/blocks/       ← one renderer per block
components/public/PageRenderer  ← doc → page
components/builder/             ← the studio (section list, inspector, design, settings)
app/editor/                     ← the studio route + its preview frame
```

**Adding a block takes three edits, all required:**
1. an entry in `BLOCK_DEFS` (`lib/builder/blocks.ts`),
2. a renderer wired into `BLOCK_RENDERERS` (`components/public/blocks/index.ts`),
3. its type in `BLOCKS` in the backend's `pageController.js` — **that list is the
   authority and silently drops any type it does not know**, so a block missing there
   disappears on save with no error.

⚠️ **Blocks never define their own colours.** Everything reads the `--pb-*` CSS variables
that `designToCssVars()` puts on the page root. That is the whole reason a palette change
repaints the page; a hardcoded colour in a block breaks it for every other palette.

⚠️ **`PublicLanding` still renders the old fixed layout when `shop.page` is null.** The
builder is opt-in per business (`businesses.builder_enabled`, flipped by Publish), so
both paths are live at the same time. Don't delete the `PL*` components.

⚠️ **`lib/builder/runtime.ts` duplicates the server's URL allow-list on purpose.** The
server is the real gate, but the studio renders an unsaved draft straight from local
state that never passed through it. Both layers check — the project's boundary rule.

⚠️ **Custom colours are gated to Negocio** (the old "marca propia" entitlement). The
server strips `design.colors` from the published copy below that plan; `DesignPanel`
locks the controls so the editor never promises what the live page won't show.

⚠️ **The "Hecho con Novu" footer link is not optional.** There is no `showNovu`
field on the document, the server's `sanitizeFooter` drops the key so it cannot be
persisted even by calling the API directly, and `PageRenderer` draws it in a
minimal strip when the owner turns the whole footer off. Don't add a toggle back.

The existing `/dashboard/landing` tabs stay, but once `builder_enabled` is true they
split in two and **only some of them still have any effect**:

| Tab | With the builder published |
|---|---|
| Contacto · Horarios · FAQs · Productos · Reseñas · Galería · Equipo · Sucursales | **Source of truth.** The data-driven blocks read these records. |
| Identidad → URL, Logo | **Source of truth.** The built nav uses `shop.logo_url`. |
| Identidad → Presentación, Fotos, Sobre nosotros | **Superseded** by the hero / imageText / richText blocks. `tagline` and `lede` survive only as fallbacks when the hero's own props are empty. |
| Diseño → Paleta, Tipografía | **Superseded** by `doc.design`. Saving there changes nothing on the live page. |

⚠️ Those superseded cards are **hidden** once `builderActive` (from
`GET /api/landing/page`) is true, and a `MovedToEditor` banner says where they went.
Marking them was tried first and was not enough: the palette card still showed a
*selected* theme and the typography card a *selected* font, neither of which matched the
document, so the tab kept asserting something false about the live page.

⚠️ Hiding them was only safe after **`HeroBlock` stopped falling back to
`shop.tagline` / `shop.lede` / `shop.cover_url`**. Those fallbacks meant a hidden field
could still reach the page with no control anywhere to change it. The document is now
the hero's only source; the one thing still inherited is `shop.name`, which has no
competing control. The columns stay for the legacy page.

If you add a builder feature that supersedes an old tab, hide the old one **and** cut
any silent fallback into it, in the same change.

⚠️ **Anything that may differ per screen size travels as a CSS variable or a
`data-*` attribute, never as an inline property.** Inline styles cannot hold a media
query, so `sectionCss` emits `--pb-pad-t` / `--pb-pad-t-m` and `builder.css` picks
between them; `sectionData` emits `data-align-m` and `data-hide` for the same reason.
Attributes are also what lets the mobile rules outrank the desktop ones — mobile
alignment has to beat `.pb-align-center .pb-sub` and its six siblings, and
`.pb-section[data-align-m]` does that without restating the list.

⚠️ **A per-device override must undo the desktop rule, not just add its own.** Setting
mobile alignment to "left" while `.pb-align-center .pb-sub { margin-inline: auto }` is
still in force left the text left-aligned and the inner blocks still centred. Every
`[data-align-m='center']` rule has a matching `left`/`right` rule that resets it.

⚠️ **New per-device and framing defaults are emitted only when the owner sets them**
(`--pb-cols-m`, `object-position`). The CSS fallback is the old hardcoded value, so
already-published pages render byte-identically until someone touches the control.

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

⚠️ **A fourth time, with a different cause: an undefined custom property.** The booking
modal is styled with `--pl-*` tokens, and those live on `[data-pl-theme]`, which hangs
off `.pl-page`. `PLReserveModal` renders **outside** that element, so on a builder page —
whose root is `.pb-page` — every token resolved to nothing and
`background: var(--pl-glass-strong)` produced a fully transparent panel.

The modal's rules now carry **solid fallbacks at the point of use**
(`var(--pl-glass-strong, #141019)`), not a redefinition, so the legacy page keeps its
per-theme colours. `designToModalVars()` additionally maps the built page's palette onto
those tokens so the modal matches the page. **A `var()` with no fallback is a silent
failure whenever the component can render outside the element that defines the token.**

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
Google (OAuth + Maps + Fonts), Fontshare (loaded by an `@import` in `system.css`),
Mercado Pago, OpenStreetMap and YouTube/Vimeo. **Adding a new third-party script,
iframe, font, or API call requires adding its domain here** — otherwise the browser
silently blocks it. That is the single most likely way this file breaks a feature.

⚠️ **OpenStreetMap is two different hosts in two different directives**, and both were
missing at some point, each breaking a feature with no error anywhere:

| Host | Directive | Used by |
|---|---|---|
| `www.openstreetmap.org` | `frame-src` | the map iframe in the Ubicación block / `PLLocation` |
| `nominatim.openstreetmap.org` | `connect-src` | the address autocomplete in `/dashboard/landing` |

Getting one right does not cover the other. When a feature that calls out to a third
party "does nothing", check this allowlist **first** — three bugs so far have been
exactly this, and a `catch {}` around the call turns it into a silent one.

⚠️ **`connect-src` is baked at build time from `NEXT_PUBLIC_API_URL`.** If that variable
is missing or wrong in Vercel, the CSP pins `connect-src` to `localhost` and **every API
call fails in production**. It is now a second failure mode for that variable, not just
a wrong base URL.

⚠️ `frame-ancestors 'none'` + `X-Frame-Options: DENY` block embedding anywhere — with
**one deliberate exception**: `/editor/preview` answers `frame-ancestors 'self'` +
`X-Frame-Options: SAMEORIGIN`, because the builder previews the page in a same-origin
iframe so real CSS breakpoints react to the chosen device width. `headers()` therefore
returns **two** entries, the general one guarded by a negative lookahead
(`/:path((?!editor/preview$).*)`). Every other route still answers `'none'` / `DENY`.
If businesses should ever embed their booking page in their own site, `/public/*` is the
next route to relax — same pattern.

⚠️ `frame-src` must list every iframe host. It now carries `openstreetmap.org` — which
`PLLocation`'s map **already needed and never had**, so the map was silently blocked in
production — plus YouTube/Vimeo for the builder's video block. `videoEmbed()` in
`lib/builder/runtime.ts` only ever emits those two hosts, so the two lists cannot drift
into rendering an iframe the browser kills.

`challenges.cloudflare.com` sits in `script-src`, `frame-src` and `connect-src` for
**Cloudflare Turnstile** (`components/Turnstile.tsx`). The widget guards login, signup,
forgot-password, `/public/[slug]/book` and `PLReserveModal`; each sends
`turnstileToken` in the body and resets the widget after a failed submit (tokens are
single-use). With `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset the widget renders nothing and
forms don't wait for a token. The backend enforces it only once `TURNSTILE_SECRET_KEY` is
set there — deploy the site key here **first**.

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
| 13 | A new builder block needs its type in the **backend's** `BLOCKS` too, or it is dropped on save without an error |
| 14 | Builder blocks must style from `--pb-*` vars only — a hardcoded colour breaks every other palette |
| 15 | `/editor/preview` is the one route allowed to be framed; don't collapse `headers()` back to a single entry |
| 16 | The legacy `PL*` public components are still live for businesses that haven't published a document |

**Reference case — the `employee_id` bug.** `components/public/PLReserveModal.tsx` fell
back to `employees[0]?.id`; when a service had no employees assigned the array was empty →
`undefined` → the API received `null` → NOT NULL violation in production. Fixed on both
sides: the modal now blocks submit with a user-facing message, and the API 400s on missing
fields. **Pattern to copy: validate at the boundary in both layers.**

---

## Task recipes

**Add a dashboard page** → `src/app/dashboard/<name>/page.tsx`; gate with `role` /
`permissions` from `useAuth()`; data via `@/lib/api`.

**Add a public-page block** → `BLOCK_DEFS` entry in `lib/builder/blocks.ts` + renderer in
`components/public/blocks/` wired into `BLOCK_RENDERERS` + the type added to `BLOCKS` in
the backend's `pageController.js`. Styles go in `src/styles/builder.css`, using `--pb-*`
variables only.

**Touch the legacy public page** → `src/components/public/PL*.tsx` + `src/styles/public.css`
+ `PublicLanding.tsx`. Only reached while `shop.page` is null.

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
