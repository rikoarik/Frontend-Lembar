# Release Gate Report

Generated: 2026-07-19T03:56:37.146Z

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
> vitest run


 RUN  v2.1.8 /Users/macbookm2/.ao/data/worktrees/frontend-lembar/frontend-lembar-10

 ✓ src/lib/runtime/__tests__/env.test.ts (8 tests) 6ms
 ✓ src/features/auth/validation/__tests__/auth-validation.test.ts (7 tests) 5ms
 ✓ scripts/__tests__/secret-scan.test.ts (3 tests) 202ms
 ✓ app/components/ui/__tests__/visual-fixtures.test.tsx (3 tests) 100ms
 ✓ app/components/ui/__tests__/primitives.test.tsx (7 tests) 239ms
 ✓ app/__tests__/marketing.test.tsx (3 tests) 166ms
 ✓ src/services/auth/__tests__/errorMapping.test.ts (20 tests) 3ms
 ✓ app/__tests__/auth.test.tsx (4 tests) 557ms

 Test Files  8 passed (8)
      Tests  55 passed (55)
   Start at  10:56:20
   Duration  2.38s (transform 546ms, setup 662ms, collect 2.26s, tests 1.28s, environment 4.15s, prepare 642ms)

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
[warn] app/(marketing)/bantuan/page.tsx
[warn] app/(marketing)/faq/page.tsx
[warn] app/(marketing)/harga/page.tsx
[warn] app/(marketing)/keamanan-data/page.tsx
[warn] app/(marketing)/kontak/page.tsx
[warn] app/(marketing)/layout.tsx
[warn] app/(marketing)/page.tsx
[warn] app/(marketing)/privasi/page.tsx
[warn] app/(marketing)/syarat/page.tsx
[warn] app/(marketing)/tentang/page.tsx
[warn] app/(marketing)/untuk-sekolah/page.tsx
[warn] app/components/marketing/AnnouncementBanner.tsx
[warn] app/components/marketing/MarketingFooter.tsx
[warn] app/components/marketing/MarketingSubPageLayout.tsx
[warn] app/components/marketing/MockupPanels.tsx
[warn] app/components/marketing/SubPageNavbar.tsx
[warn] app/layout.tsx
[warn] pnpm-lock.yaml
[warn] public/mockServiceWorker.js
[warn] Code style issues found in 38 files. Run Prettier with --write to fix.
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
