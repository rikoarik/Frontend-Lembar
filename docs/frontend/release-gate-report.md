# Release Gate Report

Generated: 2026-07-19T09:47:20.663Z

**Summary:** 15 pass, 0 fail, 0 skip

| Check                            | Status | Summary                                   |
| -------------------------------- | ------ | ----------------------------------------- |
| typecheck                        | PASS   | exit 0                                    |
| lint                             | PASS   | exit 0                                    |
| test                             | PASS   | exit 0                                    |
| build                            | PASS   | exit 0                                    |
| format:check                     | PASS   | exit 0                                    |
| axe-core load                    | PASS   | axe-core 4.10.3 loaded from cdn           |
| console guard — home             | PASS   | no console errors                         |
| prefers-reduced-motion — home    | PASS   | all animations halted                     |
| axe-core — home                  | PASS   | 0 total violation(s) (0 critical/serious) |
| console guard — school           | PASS   | no console errors                         |
| prefers-reduced-motion — school  | PASS   | all animations halted                     |
| axe-core — school                | PASS   | 0 total violation(s) (0 critical/serious) |
| console guard — pricing          | PASS   | no console errors                         |
| prefers-reduced-motion — pricing | PASS   | all animations halted                     |
| axe-core — pricing               | PASS   | 0 total violation(s) (0 critical/serious) |

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
[0m[4m/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/(marketing)/page.tsx[24m[0m
[0m  [2m41:15[22m  [33mwarning[39m  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  [2m@next/next/no-img-element[22m[0m
[0m[0m
[0m[4m/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/(marketing)/untuk-sekolah/page.tsx[24m[0m
[0m  [2m11:13[22m  [33mwarning[39m  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  [2m@next/next/no-img-element[22m[0m
[0m  [2m18:13[22m  [33mwarning[39m  Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages                                                                                                                                    [2m@next/next/no-html-link-for-pages[22m[0m
[0m[0m
[0m[4m/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/components/marketing/MarketingFooter.tsx[24m[0m
[0m  [2m16:17[22m  [33mwarning[39m  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  [2m@next/next/no-img-element[22m[0m
[0m  [2m37:15[22m  [33mwarning[39m  Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages                                                                                                                                    [2m@next/next/no-html-link-for-pages[22m[0m
[0m[0m
[0m[4m/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/components/marketing/SubPageNavbar.tsx[24m[0m
[0m  [2m19:11[22m  [33mwarning[39m  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  [2m@next/next/no-img-element[22m[0m
[0m[0m
[0m[4m/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/public/mockServiceWorker.js[24m[0m
[0m  [2m1:1[22m  [33mwarning[39m  Unused eslint-disable directive (no problems were reported)[0m
[0m[0m
[0m[33m[1m✖ 14 problems (0 errors, 14 warnings)[22m[39m[0m
[0m[33m[1m[22m[39m[33m[1m  0 errors and 1 warning potentially fixable with the `--fix` option.[22m[39m[0m
[0m[33m[1m[22m[39m[0m
```

### test — PASS

Summary: exit 0

```
 [32m✓[39m app/components/ui/__tests__/primitives.test.tsx [2m([22m[2m7 tests[22m[2m)[22m[33m 330[2mms[22m[39m
 [32m✓[39m app/__tests__/marketing.test.tsx [2m([22m[2m3 tests[22m[2m)[22m[90m 280[2mms[22m[39m
 [32m✓[39m src/lib/runtime/__tests__/env.test.ts [2m([22m[2m8 tests[22m[2m)[22m[90m 5[2mms[22m[39m
 [32m✓[39m src/services/auth/__tests__/errorMapping.test.ts [2m([22m[2m20 tests[22m[2m)[22m[90m 14[2mms[22m[39m
 [32m✓[39m src/features/workspace/__tests__/workspaceContext.test.tsx [2m([22m[2m2 tests[22m[2m)[22m[90m 129[2mms[22m[39m
 [32m✓[39m app/__tests__/lead-form.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[33m 947[2mms[22m[39m
   [33m[2m✓[22m[39m school lead form[2m > [22msubmits successfully with phone instead of email without revealing contact existence [33m366[2mms[22m[39m
   [33m[2m✓[22m[39m school lead form[2m > [22msurfaces rate-limit copy (HTTP 429) without exposing internals [33m370[2mms[22m[39m
 [32m✓[39m app/__tests__/lead-route.test.ts [2m([22m[2m2 tests[22m[2m)[22m[90m 38[2mms[22m[39m
 [32m✓[39m app/(app)/__tests__/shell-routes.test.ts [2m([22m[2m1 test[22m[2m)[22m[90m 1[2mms[22m[39m
 [32m✓[39m app/(app)/__tests__/shell-states.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[90m 50[2mms[22m[39m
 [32m✓[39m app/__tests__/auth.test.tsx [2m([22m[2m4 tests[22m[2m)[22m[33m 778[2mms[22m[39m
   [33m[2m✓[22m[39m auth pages render[2m > [22mregister page surfaces mismatch error on confirmation [33m436[2mms[22m[39m

[2m Test Files [22m [1m[32m13 passed[39m[22m[90m (13)[39m
[2m      Tests [22m [1m[32m68 passed[39m[22m[90m (68)[39m
[2m   Start at [22m 16:47:02
[2m   Duration [22m 2.68s[2m (transform 638ms, setup 1.43s, collect 2.97s, tests 2.93s, environment 5.97s, prepare 934ms)[22m

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
```

### build — PASS

Summary: exit 0

```
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
├ ○ /untuk-sekolah
└ ƒ /v1/leads/school


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### format:check — PASS

Summary: exit 0

```
> frontend-lembar@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
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
