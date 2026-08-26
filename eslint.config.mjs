import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Not the redundant copy of eslint-config-next's defaults — these are the
  // extra paths we actually need out: build output, coverage reports, and the
  // vendored Claude Code tooling (`.claude/**`, `.impeccable/**`) whose scripts
  // otherwise trip `@typescript-eslint/no-require-imports` and fail `npm run lint`.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    ".claude/**",
    ".impeccable/**",
  ]),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // eslint-config-next ships these as "warn"; with `eslint --max-warnings 0`
      // that's already fatal, but making them errors keeps the intent explicit.
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
