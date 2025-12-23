# 📁 PROJECT STRUCTURE 
### Repository Layout
*   `/src/app`: Application routes, pages, and API endpoints (Next.js App Router).
*   `/src/actions`: Server Actions containing backend business logic and DB mutations.
*   `/src/components`: Reusable UI components (shadcn/ui and custom).
*   `/src/lib`: Shared utilities, helpers, and Supabase client initializations.
*   `/src/types`: TypeScript definitions and generated database types.
*   `/extension`: Browser extension source code (Vite + React + Tailwind).
*   `/supabase`: Local Supabase configuration, SQL migrations, and seed data.
*   `/tests/e2e`: Playwright end-to-end tests and test utilities.
*   `/public`: Static assets like images, icons, and fonts for the main web app.
*   `/.github`: CI/CD workflows and GitHub-specific configurations.
*   `/test-results` & `/playwright-report`: Generated artifacts from E2E test runs (ignored by git).

### Testing Setup
* **Runner:** Vitest (Unit/Integration), Playwright (E2E).
* **Local DB:** Supabase CLI (Docker).
* **Commands:** `npm run test:unit`, `npm run test:e2e:quick`, (requires `npx supabase start`), `npm run lint`.
