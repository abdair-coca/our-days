# Our Days

Our Days is a mobile-first, private-album prototype for two people. Phase 0 provides a complete, navigable local scaffold: polished base routes, deterministic demo memories, form validation, and future Supabase connection points without requiring credentials.

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
- `/memories/new` — demo create form
- `/memories/[id]/edit` — demo edit form populated from local data
- `/settings` — local space and connection status
- `/login` and `/invite` — non-authenticated preview routes

All pages use local deterministic data. Create and edit submissions validate in the browser, display a demo confirmation, and do not persist or transmit data.

## Architecture

The app is a modular Next.js monolith. Server Components are the default. Client Components are limited to current-route navigation, the React Hook Form interaction, the demo submission hook, the error boundary, and the Motion reveal wrapper.

### Memory data design

`features/memories/catalog.ts` defines the `MemoryCatalog` module interface:

- `list()` returns memories newest-first.
- `getById(id)` returns one memory or `null`.
- `years()` returns available years in descending order.

This interface is the memory-reading seam used by pages. `localMemoryCatalog` is the current adapter at that seam and owns all deterministic demo data. A future Supabase adapter can satisfy the same interface, keeping replacement local to the feature instead of spreading database details through page modules.

The module is intentionally deeper than a data export: ordering, lookup miss behavior, year extraction, and demo ownership remain behind its small interface. Pages handle only presentation-specific filtering.

### Other module decisions

- `lib/validations` owns Zod schemas shared by form modules.
- `components/forms/MemoryForm` uses React Hook Form with a Zod-backed resolver and clearly marks its non-persistent behavior.
- `lib/supabase` is an environment-aware adapter seam. Browser and server helpers return `null` when optional public configuration is absent. Demo pages do not import either helper.
- `features/photos` records the future image constraints without implementing upload or processing.
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

No environment variables are required for the Phase 0 demo. Copy `.env.example` to `.env.local` only when preparing a Supabase project.

| Variable | Exposure | Phase 0 behavior |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe project URL | Optional; adapter returns `null` when absent |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe legacy anon key | Optional fallback public key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe modern publishable key | Optional; preferred over anon key when set |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Optional and currently unused; never expose to client code |

The service-role key is deliberately absent from browser helpers and must never use a `NEXT_PUBLIC_` prefix.

## Accessibility and responsive behavior

- Semantic landmarks and heading hierarchy
- Skip links on app and authentication shells
- Keyboard-accessible links and controls with visible focus rings
- Large touch targets and mobile bottom navigation
- Explicit labels, validation errors, descriptions, and live submission status
- Responsive cards and editorial desktop layouts
- Reduced-motion handling in CSS and Motion

## Current demo limitations

- No real authentication, authorization, database, Row Level Security, storage, signed URLs, or credentials
- No persistent create/edit/delete behavior
- File selection is local; images are not read, compressed, reordered, or uploaded
- Visuals are CSS gradients plus a repository-owned SVG; no remote or copyrighted photos are fetched
- Song links open provider home pages and do not embed playback
- Loading and error interfaces exist, but deterministic local reads normally resolve immediately

## Next steps

1. Establish visual tokens and reusable interactive states with real-device review.
2. Add a Supabase `MemoryCatalog` adapter while keeping the local adapter for previews.
3. Introduce authentication, space membership, RLS policies, and private storage together so privacy is end-to-end.
4. Add image validation, resizing, compression, ordering, upload progress, and recovery.
5. Replace demo form submission with server-side mutation logic and revalidation.

## Work-unit boundary

The scaffold is one uncommitted work unit. Its rollback boundary is every new project file listed above, excluding the pre-existing `project-phases.md`. No Git operation is required to run or inspect it.
