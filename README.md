# Job Tracker SaaS

> **Documentation:** Detailed project documentation (Tech Stack, API, Standards) is in the `docs/` folder.

A simple, fast, and extension-first job tracking tool.

### 1. Prerequisites

You need `Node.js` (v18+) and `npm` installed.

### 2. Environment Setup

**This project supports two environments: Local (Docker) and Production (Remote).**

#### A. Local Development (Default)
We use a local Supabase instance running in Docker for development and testing.

1.  **Start Local Supabase:**
    ```bash
    npx supabase start
    ```
    This spins up a full Supabase stack (DB, Auth, API) locally.

2.  **Configure Environment:**
    The `.env.local` file is already pre-configured for this local instance (ports 54321, etc.).
    *If you need to reset it:*
    ```bash
    echo "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" > .env.local
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_LOCAL_ANON_KEY" >> .env.local
    # (Keys are printed by `npx supabase start`)
    ```

#### B. Production / Deployment
To deploy your app (e.g., to Vercel) so you can use it remotely:

1.  **Retrieve Remote Keys:**
    Your remote Supabase keys have been backed up to `.env.remote.backup`.
2.  **Set Environment Variables:**
    Copy the values from `.env.remote.backup` into your hosting provider's (e.g., Vercel) "Environment Variables" settings.
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Running the Website (Local)

Ensure Supabase is running (`npx supabase start`), then:

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The app will connect to your local Docker database.

### 4. Running the Extension (Development)

The extension code lives in the `/extension` folder.

```bash
cd extension
npm install
npm run build
```
To load it into Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right).
3. Click "Load unpacked".
4. Select the `extension/dist` folder.

## End-to-End Tests (Playwright)

1. Start local Supabase in Docker: `npx supabase start`
2. Copy env template: `cp playwright.env.example playwright.env` (adjust if your local Supabase ports/keys differ)
3. Run tests: `npx playwright test`


