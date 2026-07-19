# Release Gate Report

Generated: 2026-07-18T20:22:26.091Z

**Summary:** 7 pass, 8 fail, 0 skip

| Check                            | Status | Summary                                   |
| -------------------------------- | ------ | ----------------------------------------- |
| typecheck                        | PASS   | exit 0                                    |
| lint                             | PASS   | exit 0                                    |
| test                             | FAIL   | exit 1                                    |
| build                            | PASS   | exit 0                                    |
| format:check                     | FAIL   | exit 1                                    |
| axe-core load                    | PASS   | axe-core 4.10.3 loaded from cdn           |
| console guard — home             | FAIL   | 2 console error(s)                        |
| prefers-reduced-motion — home    | FAIL   | 1 animation(s) still running              |
| axe-core — home                  | PASS   | 0 total violation(s) (0 critical/serious) |
| console guard — school           | FAIL   | 1 console error(s)                        |
| prefers-reduced-motion — school  | FAIL   | 1 animation(s) still running              |
| axe-core — school                | PASS   | 0 total violation(s) (0 critical/serious) |
| console guard — pricing          | FAIL   | 1 console error(s)                        |
| prefers-reduced-motion — pricing | FAIL   | 2 animation(s) still running              |
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

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/(marketing)/untuk-sekolah/page.tsx
  11:13  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
  14:13  warning  Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages                                                                                                                                    @next/next/no-html-link-for-pages

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/components/marketing/MarketingFooter.tsx
  13:17  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
  33:15  warning  Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages                                                                                                                                    @next/next/no-html-link-for-pages

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/components/marketing/SubPageNavbar.tsx
  19:11  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/app/layout.tsx
  21:9  warning  Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font

/Users/macbookm2/.ao/data/worktrees/frontend-lembar/orchestrator/frontend-lem-orchestrator/public/mockServiceWorker.js
  1:1  warning  Unused eslint-disable directive (no problems were reported)

✖ 10 problems (0 errors, 10 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.
```

### test — FAIL

Summary: exit 1

```
                [36m<div[39m
                  [33mclass[39m=[32m"flex items-start gap-unit-3"[39m
                [36m>[39m
                  [36m<span[39m
                    [33mclass[39m=[32m"material-symbols-outlined text-burgundy"[39m
                    [33mstyle[39m=[32m"font-variation-settings: 'wght' 600;"[39m
           ...
 ❯ Object.getElementError node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ app/__tests__/marketing.test.tsx:48:26
     46|   it('harga page renders Figma 130:741 plans, transparency, and FAQ', …
     47|     renderWithLayout(PricingPage);
     48|     const brand = screen.getByText(/^lembar$/, { selector: '.nav__word…
       |                          ^
     49|     expect(brand).toBeInTheDocument();
     50|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯
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
[warn] docs/frontend/UI-STATES.md
[warn] docs/product/BUSINESS-ROLES-PERMISSIONS.md
[warn] docs/product/DECISIONS.md
[warn] docs/tasks/TASK-REGISTRY.yaml
[warn] package.json
[warn] pnpm-lock.yaml
[warn] postcss.config.js
[warn] public/mockServiceWorker.js
[warn] src/features/auth/state/useAuthSubmit.ts
[warn] src/features/auth/validation/auth-validation.ts
[warn] src/lib/marketing/home.ts
[warn] src/lib/runtime/__tests__/env.test.ts
[warn] src/lib/runtime/env.ts
[warn] src/lib/runtime/index.ts
[warn] src/mocks/handlers/auth.ts
[warn] src/services/auth/__tests__/errorMapping.test.ts
[warn] src/services/auth/errorMapping.ts
[warn] src/types/result.ts
[warn] tailwind.config.js
[warn] Code style issues found in 77 files. Run Prettier with --write to fix.
```

### axe-core load — PASS

Summary: axe-core 4.10.3 loaded from cdn

```
(no detail)
```

### console guard — home — FAIL

Summary: 2 console error(s)

```
console.error: Failed to load resource: the server responded with a status of 404 (Not Found)
console.error: Connecting to 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' violates the following Content Security Policy directive: "connect-src 'self'". The action has been blocked.
```

### prefers-reduced-motion — home — FAIL

Summary: 1 animation(s) still running

```
route should respect prefers-reduced-motion: reduce
```

### axe-core — home — PASS

Summary: 0 total violation(s) (0 critical/serious)

```
wcag2a + wcag2aa tags; 0 total
```

### console guard — school — FAIL

Summary: 1 console error(s)

```
console.error: Connecting to 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' violates the following Content Security Policy directive: "connect-src 'self'". The action has been blocked.
```

### prefers-reduced-motion — school — FAIL

Summary: 1 animation(s) still running

```
route should respect prefers-reduced-motion: reduce
```

### axe-core — school — PASS

Summary: 0 total violation(s) (0 critical/serious)

```
wcag2a + wcag2aa tags; 0 total
```

### console guard — pricing — FAIL

Summary: 1 console error(s)

```
console.error: Connecting to 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' violates the following Content Security Policy directive: "connect-src 'self'". The action has been blocked.
```

### prefers-reduced-motion — pricing — FAIL

Summary: 2 animation(s) still running

```
route should respect prefers-reduced-motion: reduce
```

### axe-core — pricing — PASS

Summary: 0 total violation(s) (0 critical/serious)

```
wcag2a + wcag2aa tags; 0 total
```
