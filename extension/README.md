# Job Tracker Chrome Extension

This is the browser extension companion for the Job Tracker SaaS. It allows users to quickly scrape job descriptions from any website, analyze them using AI, and save them to their dashboard.

## 🚀 Features

*   **Auth Integration:** Syncs login state with the main Next.js web app (localhost:3000).
*   **One-Click Analysis:** Scrapes the active tab's content using `@mozilla/readability`.
*   **AI Processing:** Sends cleaned text to the backend (`/api/analyze-job`) to extract:
    *   Company Name
    *   Position / Role
    *   Location & Format (Remote/Hybrid/Office)
    *   Industry (e.g., SaaS, FinTech)
    *   Summary
*   **State Persistence:** Saves analysis progress and results to `chrome.storage.local`, so you don't lose data if you accidentally close the popup.

## 🛠️ Development Setup

1.  **Install Dependencies:**
    ```bash
    cd extension
    npm install
    ```

2.  **Build in Watch Mode (Recommended):**
    This will rebuild the extension whenever you make changes.
    ```bash
    npm run dev
    # OR manually:
    npm run build
    ```
    *Note: Since this is a Vite app, `npm run dev` starts a dev server, but for Chrome Extensions, you usually need the static `dist` folder. Run `npm run build` to generate it.*

3.  **Load into Chrome:**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable **Developer mode** (toggle in top right).
    *   Click **Load unpacked**.
    *   Select the `extension/dist` directory.

4.  **Test:**
    *   Ensure the main web app is running (`npm run dev` in the project root).
    *   Log in to the web app.
    *   Open the extension on a job posting page.

## 📦 Architecture

*   **Framework:** React + TypeScript + Vite.
*   **Styling:** Tailwind CSS.
*   **Permissions:**
    *   `activeTab` & `scripting`: To access page content.
    *   `storage`: To save form state.
    *   `cookies`: To check `sb-access-token` for authentication.

## ⚠️ Notes

*   The extension relies on the main web app running at `http://localhost:3000` for API calls.
*   CORS is handled by the Next.js backend to allow requests from the extension.