# 🛠️ TECH STACK & ARCHITECTURE

## Tech Stack
* **Framework:** Next.js 14+ (App Router).
* **Language:** TypeScript (Strict mode).
* **Database & Auth:** Supabase (PostgreSQL).
* **Styling:** Tailwind CSS (v4).
* **UI Components:** Shadcn/ui (Radix primitives).
* **Backend Logic:** Next.js Server Actions.
* **Testing:** Vitest (Unit) + Playwright (E2E) with Local Supabase.

## ARCHITECTURAL RULES

* **No "Cheap" Hacks:** Propose proper setup (Docker, etc.) over code hacks (User-Agent masking, increased timeouts).
* **Decision Matrix:** For major choices, present "Quick" vs "Standard/Robust" options with trade-offs.
* **Root Cause Analysis:** Identify if a bug is code, network, or environment related before fixing.
* **Critical:** Challenge any requests for "quick hacks" if they violate the project's long-term health.

### Scalability vs. Velocity
* **Infrastructure:** Use Local Docker (Supabase CLI) for dev/test to ensure parity.
* **Long-term Thinking:** Evaluate solutions for operational and team scalability.
* **Server Components First:** Use Server Components by default. Add `'use client'` ONLY for interactivity.

### Backend (Server Actions)
* **Location:** All mutations must go into `src/actions/`.
* **Security:** Validate user session (`getUser`) in every Server Action.
* **Validation:** Use `zod` to validate all inputs. Return typed objects: `{ success: boolean, data?: T, error?: string }`.

### Database (Supabase)
* **RLS:** Row Level Security must be enabled on ALL tables.
* **Types:** Use generated Supabase types. Run `npm run gen-types` after DB changes.
