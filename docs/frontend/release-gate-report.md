# Release Gate Report

Generated: 2026-07-19T03:58:41.632Z

**Summary:** 14 pass, 1 fail, 0 skip

| Check | Status | Summary |
| --- | --- | --- |
| typecheck | PASS | exit 0 |
| lint | PASS | exit 0 |
| test | PASS | exit 0 |
| build | PASS | exit 0 |
| format:check | FAIL | exit 1 |
| axe-core load | PASS | axe-core 4.10.3 loaded from cdn |
| console guard — home | PASS | no console errors |
| prefers-reduced-motion — home | PASS | all animations halted |
| axe-core — home | PASS | 0 total violation(s) (0 critical/serious) |
| console guard — school | PASS | no console errors |
| prefers-reduced-motion — school | PASS | all animations halted |
| axe-core — school | PASS | 0 total violation(s) (0 critical/serious) |
| console guard — pricing | PASS | no console errors |
| prefers-reduced-motion — pricing | PASS | all animations halted |
| axe-core — pricing | PASS | 0 total violation(s) (0 critical/serious) |

## Detail

### typecheck — PASS

Summary: exit 0

```
> frontend-lembar@0.1.0 typecheck
> tsc --noEmit
```

### lint — PASS

Summary: exit 0

```

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/frontend-lembar-10/app/(marketing)/page.tsx
  43:15  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/frontend-lembar-10/app/(marketing)/untuk-sekolah/page.tsx
  11:13  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
  14:13  warning  Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages                                                                                                                                    @next/next/no-html-link-for-pages

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/frontend-lembar-10/app/components/marketing/MarketingFooter.tsx
  17:17  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
  37:15  warning  Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages                                                                                                                                    @next/next/no-html-link-for-pages

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/frontend-lembar-10/app/components/marketing/SubPageNavbar.tsx
  19:11  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/frontend-lembar-10/public/mockServiceWorker.js
  1:1  warning  Unused eslint-disable directive (no problems were reported)

✖ 9 problems (0 errors, 9 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.
```

### test — PASS

Summary: exit 0

```
 ✓ scripts/__tests__/secret-scan.test.ts (3 tests) 223ms
 ✓ app/components/ui/__tests__/visual-fixtures.test.tsx (3 tests) 122ms
 ✓ app/components/ui/__tests__/primitives.test.tsx (7 tests) 340ms
 ✓ app/__tests__/marketing.test.tsx (3 tests) 236ms
 ✓ src/lib/runtime/__tests__/env.test.ts (8 tests) 6ms
 ✓ src/services/auth/__tests__/errorMapping.test.ts (20 tests) 3ms
 ✓ src/features/workspace/__tests__/workspaceContext.test.tsx (2 tests) 83ms
 ✓ app/__tests__/lead-form.test.tsx (4 tests) 924ms
   ✓ school lead form > submits successfully with phone instead of email without revealing contact existence 368ms
   ✓ school lead form > surfaces rate-limit copy (HTTP 429) without exposing internals 302ms
 ✓ app/(app)/__tests__/shell-states.test.tsx (4 tests) 52ms
 ✓ app/__tests__/auth.test.tsx (4 tests) 628ms
   ✓ auth pages render > register page surfaces mismatch error on confirmation 321ms

 Test Files  11 passed (11)
      Tests  65 passed (65)
   Start at  10:58:22
   Duration  2.55s (transform 598ms, setup 974ms, collect 2.97s, tests 2.63s, environment 5.53s, prepare 763ms)

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
```

### build — PASS

Summary: exit 0

```
├ ○ /bantuan
├ ○ /daftar
├ ○ /faq
├ ○ /harga
├ ○ /keamanan-data
├ ○ /kontak
├ ○ /lupa-sandi
├ ○ /masuk
├ ○ /privasi
├ ○ /reset-sandi
├ ○ /robots.txt
├ ○ /sitemap.xml
├ ○ /syarat
├ ○ /tentang
├ ƒ /undangan/[token]
└ ○ /untuk-sekolah


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### format:check — FAIL

Summary: exit 1

```
[warn] app/components/app/LeftRail.tsx
[warn] app/components/app/ShellStates.tsx
[warn] app/components/app/TopBar.tsx
[warn] app/components/app/WorkspaceSwitcher.tsx
[warn] app/components/marketing/AnnouncementBanner.tsx
[warn] app/components/marketing/MarketingFooter.tsx
[warn] app/components/marketing/MarketingSubPageLayout.tsx
[warn] app/components/marketing/MockupPanels.tsx
[warn] app/components/marketing/SubPageNavbar.tsx
[warn] app/layout.tsx
[warn] docs/frontend/release-gate-report.md
[warn] pnpm-lock.yaml
[warn] public/mockServiceWorker.js
[warn] src/features/leads/SchoolLeadForm.tsx
[warn] src/features/workspace/workspaceContext.tsx
[warn] src/mocks/handlers/leads.ts
[warn] src/services/leads/errorMapping.ts
[warn] src/services/leads/leadsMutations.ts
[warn] src/types/leads.ts
[warn] Code style issues found in 54 files. Run Prettier with --write to fix.
```

### axe-core load — PASS

Summary: axe-core 4.10.3 loaded from cdn

```
(no detail)
```

### console guard — home — PASS

Summary: no console errors

```
h1="Dari materi menjadi lembar ujian yang siap ditinjau." lang=id
```

### prefers-reduced-motion — home — PASS

Summary: all animations halted

```
lang=id
```

### axe-core — home — PASS

Summary: 0 total violation(s) (0 critical/serious)

```
wcag2a + wcag2aa tags; 0 total
```

### console guard — school — PASS

Summary: no console errors

```
h1="Workspace Organisasi untuk Institusi Sekolah" lang=id
```

### prefers-reduced-motion — school — PASS

Summary: all animations halted

```
lang=id
```

### axe-core — school — PASS

Summary: 0 total violation(s) (0 critical/serious)

```
wcag2a + wcag2aa tags; 0 total
```

### console guard — pricing — PASS

Summary: no console errors

```
h1="Pilih paket yang sesuai untuk kebutuhan mengajar Anda." lang=id
```

### prefers-reduced-motion — pricing — PASS

Summary: all animations halted

```
lang=id
```

### axe-core — pricing — PASS

Summary: 0 total violation(s) (0 critical/serious)

```
wcag2a + wcag2aa tags; 0 total
```
