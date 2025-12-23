# 📝 CODING STANDARDS & PATTERNS
* **Naming:** logical English names (camelCase for variables, PascalCase for components).
* **Comments:** Comment "Why", not "What".
* **Dry:** Extract reusable logic to `src/lib/` or custom hooks.
* **E2E flag isolation:** `process.env.E2E_TESTING` is only allowed in tests (`tests/**`) and test support routes (`src/app/api/test-support/**`). No production code paths should branch on this flag.
