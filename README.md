# Our Days

Our Days is a mobile-first private album for two people. The app keeps a local fallback for previews, while a configured Supabase project enables real authentication, shared spaces, private memories, Storage photos, and invitation links.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

Open `http://localhost:3000` after starting the development server.

## Implemented routes

- `/` — featured and recent memories
- `/memories` — chronological gallery with year filters
- `/memories/[id]` — memory detail; unknown IDs use Next.js `notFound()`
- `/memories/new` — create a persisted memory when authenticated
- `/memories/[id]/edit` — edit a persisted memory and its ordered photos
- `/settings` — space details, invitation link, and sign out
- `/login` and `/invite` — authentication and private invitation flow

Without Supabase variables, app routes use deterministic local data. With Supabase configured, protected app routes require a session and all memory reads/writes are scoped through `space_members` and RLS.

## Architecture

The app is a modular Next.js monolith. Server Components are the default. Client Components are limited to interactive forms, current-route navigation, auth feedback, photo previews, the error boundary, and Motion wrappers.

### Memory data design

`features/memories/catalog.ts` defines the `MemoryCatalog` module interface:

- `list()` returns memories newest-first.
- `getById(id)` returns one memory or `null`.
- `years()` returns available years in descending order.

This interface is the memory-reading seam used by pages. `localMemoryCatalog` provides the deterministic fallback and `supabase-memory-repository` provides the authenticated adapter, keeping database details inside the feature instead of spreading them through page modules.

The module is intentionally deeper than a data export: ordering, lookup miss behavior, year extraction, and demo ownership remain behind its small interface. Pages handle only presentation-specific filtering.

### Other module decisions

- `lib/validations` owns Zod schemas shared by form modules.
- `components/forms/MemoryForm` uses React Hook Form with a Zod-backed resolver and sends validated mutations through the server action boundary.
- `lib/supabase` owns browser, server, and request-session adapters.
- `features/auth` owns session context, sign-in/sign-up, invite creation, and invite acceptance.
- `features/photos` owns image constraints, WebP processing, private Storage paths, signed URLs, and lazy rendering.
- `features/music` contains URL-domain knowledge, separate from visual song rendering.
- `components/gallery/MemoryGallery` exposes loaded, loading, empty, and error treatments.
- `components/motion/Reveal` uses Motion and disables entrance movement when the user prefers reduced motion. Global CSS also suppresses nonessential motion.

## Project layout

```text
app/
  (auth)/                 login and invitation routes
  (app)/                  application shell and memory routes
components/
  ui/ layout/ navigation/ memory/ gallery/ music/ forms/ motion/
features/
  auth/ memories/ photos/ music/
lib/
  supabase/ validations/ images/ constants/ utils/
hooks/
types/
public/
styles/
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in the public Supabase URL and key to enable the private flow. The local demo remains available when these values are absent.

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe project URL | Supabase project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe legacy anon key | Public fallback key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe modern publishable key | Optional; preferred over anon key when set |
| `NEXT_PUBLIC_SITE_URL` | Public origin | Origin for invite links and email confirmation callbacks |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Reserved for future administration; never expose to client code |

The service-role key is deliberately absent from browser helpers and must never use a `NEXT_PUBLIC_` prefix.

## Production authentication checklist

Before testing login on Vercel:

1. Disable Vercel Deployment Protection for the public production deployment, or test through a public custom domain. Vercel SSO otherwise intercepts `/login`, `/manifest.webmanifest`, and `/sw.js` before they reach Next.js.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) and `NEXT_PUBLIC_SITE_URL` to the Vercel Production environment, then redeploy. Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin.
3. In Supabase Auth URL Configuration, set Site URL to the same public HTTPS origin.
4. In Supabase Auth URL Configuration, allow the exact callback `https://<public-origin>/login`.
5. In Supabase Auth Email Templates → Confirm signup, use `{{ .ConfirmationURL }}` only if your flow handles the returned client session. This app uses SSR/PKCE, so use the server callback instead: `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Confirmar correo</a>`.
6. In Supabase Auth email settings, enable the Email provider and configure SMTP for reliable delivery. Check spam and the provider's delivery logs.

## Accessibility and responsive behavior

- Semantic landmarks and heading hierarchy
- Skip links on app and authentication shells
- Keyboard-accessible links and controls with visible focus rings
- Large touch targets and mobile bottom navigation
- Explicit labels, validation errors, descriptions, and live submission status
- Responsive cards and editorial desktop layouts
- Reduced-motion handling in CSS and Motion

## Current boundaries

- Email confirmation and provider settings remain controlled by Supabase Auth.
- Invite links expire after seven days and can optionally be restricted to one email.
- The current workspace model starts with one space per account; invited members join that space.
- Song links open provider home pages and do not embed playback
- Without Supabase configuration, loading and error interfaces still resolve through deterministic local data

## Next steps

1. Verify the complete authenticated flow with two accounts.
2. Add end-to-end runtime checks for invite acceptance and unauthorized access.
3. Integrate the final upload, detail, edit, and timeline flow in Phase 11.

## Work-unit boundary

Each phase is committed as a reviewable work unit. The local fallback remains the safe preview boundary when Supabase configuration is absent.
