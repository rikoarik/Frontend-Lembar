import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * ESLint flat config — the Next.js 16 shape.
 *
 * `next lint` was REMOVED in Next.js 16 (see node_modules/next/dist/docs/
 * 01-app/03-api-reference/05-config/03-eslint.md), so there is no `next lint`
 * command any more: the gate is the ESLint CLI, wired as `pnpm lint` →
 * `eslint .`. Never reintroduce `next lint` — `scripts/__tests__/ci-gates.test.ts`
 * fails the build if a script or workflow does.
 *
 * Layer order matters (later wins):
 *   1. core-web-vitals — Next/React/React-Hooks/a11y, Web-Vitals rules as errors
 *   2. typescript      — @typescript-eslint/recommended for .ts/.tsx
 *   3. scoped overrides for the baseline + legitimate CommonJS config files
 *   4. global ignores
 */
const config = [
  ...nextVitals,
  ...nextTs,
  {
    // Build/tooling config files are CommonJS by contract (Next reads them with
    // require), so `require()` is correct there, not a lint violation.
    files: ['**/*.cjs', 'tailwind.config.js', 'postcss.config.js', 'next.config.mjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Baseline. The Next 16 recommended set reports these in pre-existing code
    // (see the counts in docs/frontend/FRONTEND-QUALITY.md). They stay visible
    // as warnings so the class is caught on every run; promoting them to "error"
    // is tracked as a follow-up cleanup, not silently dropped.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      '.worktrees/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'out/**',
      'next-env.d.ts',
    ],
  },
];

export default config;
