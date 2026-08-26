/** @type {import('lint-staged').Configuration} */
const config = {
  // Lint and auto-fix staged source files. Type-check + full test run happen
  // in .husky/pre-commit (they can't be scoped to individual files).
  "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix --max-warnings 0"],
};

export default config;
