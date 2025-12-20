import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "jobtracker/no-e2e-flag-in-app-code",
    files: ["**/*.{ts,tsx,js,jsx}"],
    excludedFiles: ["tests/**", "src/app/api/test-support/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[property.name='E2E_TESTING'][object.type='MemberExpression'][object.property.name='env'][object.object.name='process']",
          message:
            "process.env.E2E_TESTING is only allowed in tests and test-support helpers.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
