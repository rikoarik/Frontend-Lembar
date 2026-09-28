# FE-VER-03 · Deploy & Smoke Snapshot

**Task:** t_bf10ab4a `[DEVOPS] Build, push, restart, smoke, snapshot`
**Plan:** docs/audit/PLAN-FE-2026-09-28.md → FE-VER-03
**Executed (UTC):** 2026-09-28T15:16Z … 2026-09-28T15:31Z
**Host:** VM-16-13-tencentos · PM2 user `hermes`

## 1. Commit SHA

| Item | Value |
|---|---|
| Deployed commit | `d2927bc431cfb1df3b55cabc14a0bd83c083738b` |
| Commit msg | `docs(audit): FE audit + remediation plan (i18n, materi, route drift)` |
| Branch (worktree) | `wt/devops-build-push-restart-smoke-snapshot` |
| PM2 cwd (deployed) | `/home/hermes/Projects/Frontend-Lembar` (branch `dev`) |
| `dev` vs `origin/dev` | 0 ahead / 0 behind (in sync) |
| Pushed | `origin/wt/devops-build-push-restart-smoke-snapshot` → `d2927bc` |

## 2. Build

```
pnpm run build   (NEXT_TELEMETRY_DISABLED=1, next 16.3.2 Turbopack)
EXIT=0
.next/BUILD_ID            = pKVKnBhXjepVC9Dc8Twi6
.next/BUILD_ID mtime       = 2026-09-28 23:25:13 +0800 (15:25:13Z)
.next/server/app/(marketing)/page.js mtime = 2026-09-28 23:24:53 +0800
```

**Blocker hit & fixed during this run:** first build failed with 113 Turbopack errors
(`Cannot find module '@vercel/turbopack/postcss'`, `Can't resolve '@swc/helpers/_/_interop_require_default'`,
`@tanstack/query-core`, `dijkstrajs`, `motion-dom`), root cause:

```
Symlink [project]/node_modules/node_modules is invalid, it points out of the filesystem root
node_modules/node_modules -> ../../node_modules   (created Sep 28 19:17)
```

A self-referential `node_modules/node_modules` symlink (from a stray `pnpm install`/`add` run in this dir)
made Turbopack resolve every bare import to `/node_modules/...`. The stray link was moved out of the tree
(`~/.hermes/profiles/lembar-devops/cache/scratch/node_modules.symlink.bak`); build then passed clean.

## 3. Restart

```
pm2 restart lembar-frontend --update-env
restart issued at (UTC): 2026-09-28T15:25:45Z
new pid                  = 1539606
pm_uptime                = 2026-09-28T15:25:48.383Z
status                   = online   (restart counter 16716 -> 16717, unstable_restarts = 0)
```

Log timestamps (`/home/hermes/.pm2/logs/lembar-frontend-out.log`, local +0800):

```
▲ Next.js 16.3.2
- Local:         http://localhost:3000
- Network:       http://172.22.16.13:3000
✓ Ready in 427ms
✓ Running next.config.mjs took 274ms
out.log mtime   = 2026-09-28 23:25:52 +0800  (15:25:52Z)
error.log mtime = 2026-09-28 23:26:08 +0800  (15:26:08Z)
```

`error.log` is stable at 218 lines; 3 further full request sweeps produced **zero new lines**.
Its contents are historical (pre-existing): `ENVIRONMENT_FALLBACK` (next-intl) ×4 and
`"next start" does not work with "output: standalone"` warning — both predate this deploy.

## 4. Smoke — HTTP code per key route

Curl sweep after restart (UTC 15:26–15:27), local `127.0.0.1:3000` + public `https://app.lembar.web.id`:

| Route | local | public |
|---|---|---|
| `/` | 200 | 200 |
| `/harga` | 200 | 200 |
| `/untuk-sekolah` | 200 | 200 |
| `/faq` | 200 | 200 |
| `/bantuan` | 200 | 200 |
| `/tentang` | 200 | 200 |
| `/kontak` | 200 | 200 |
| `/privasi` | 200 | 200 |
| `/syarat` | 200 | 200 |
| `/generator-soal-ai` | 200 | 200 |
| `/keamanan-data` | 200 | 200 |
| `/masuk` | 200 | 200 |
| `/daftar` | 200 | 200 |

**13/13 routes 200 on both local and public.**

## 5. Browser smoke (Playwright 1.61.1, chromium-1228, headless, 1280×800)

13 routes × local + public = 26 page loads. `FAILURES=0` on both runs.
Per route: HTTP 200, `<html lang="id">`, no horizontal overflow, **0 console errors / 0 page errors**.

| Route | H1 (rendered) | console errors |
|---|---|---|
| `/` | Buat soal ujian otomatis dari materi kurikulum atau PDF Anda | 0 |
| `/harga` | Pilih paket yang sesuai dengan cara Anda mengajar. | 0 |
| `/untuk-sekolah` | Workspace Organisasi untuk Institusi Sekolah | 0 |
| `/faq`, `/bantuan`, `/tentang`, `/kontak`, `/privasi`, `/syarat` | rendered, lang=id | 0 |
| `/generator-soal-ai` | Generator soal AI untuk guru Indonesia | 0 |
| `/keamanan-data` | Akses data dibuat terbatas dan dapat ditinjau. | 0 |
| `/masuk` | Masuk ke lembar | 0 |
| `/daftar` | Buat akun lembar | 0 |

Raw evidence: `smoke-live-local.json`, `smoke-live-public.json`, `snapshot.txt` (PM2 jlist + log tails).

## 6. Findings for follow-up (outside FE-VER-03 DoD)

1. **`/keamanan-data` has no page title** — `document.title` renders as bare `"lembar"` while every other
   marketing route has a proper title (e.g. `"Syarat & Ketentuan - lembar · lembar"`). Missing
   `metadata.title` in `app/(marketing)/keamanan-data/page.tsx`.
2. **Title duplication** on some routes: `/` → `"Generator Soal AI untuk Guru — lembar · lembar"` and
   `/harga` → `"... · lembar · lembar"` — suffix `lembar` is appended twice (template + literal).
3. **`node_modules/node_modules` self-symlink** will break the next build again if anything re-creates it.
   Worth a guard in the deploy script.
4. `next.config.mjs` uses `output: 'standalone'` but PM2 runs `pnpm run start` (`next start`), which Next
   warns is unsupported. It currently works; the warning is noise but the config/start-command pair should
   be reconciled.
