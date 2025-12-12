# Job Tracker SaaS

"Huntr for poor but smart people".
A simple, fast, and extension-first job tracking tool.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Shadcn/ui
- **Backend:** Next.js Server Actions
- **Database & Auth:** Supabase
- **Extension:** Vite + React (in `/extension` folder)

## Getting Started

### 1. Prerequisites

You need `Node.js` (v18+) and `npm` installed.

### 2. Environment Setup

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
3. Get your `Project URL` and `anon public key`.
4. Paste them into `.env.local`.

### 3. Running the Website

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

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

## Project Structure

- `src/` - Main Next.js application code.
- `src/actions/` - Server Actions (Backend logic).
- `src/lib/supabase/` - Database clients.
- `extension/` - Browser extension source code.