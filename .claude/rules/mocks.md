# Mock service worker (MSW)

- Endpoint: `/v1/<domain>/*`. Base path sama dengan backend.
- Handler hidup di `src/mocks/handlers/<domain>.ts`. Worker boot di `src/mocks/browser.ts`.
- Handler hanya import di dev/test. Production build tanpa handler.
- Sinyal on/off via `process.env.NEXT_PUBLIC_API_MODE` (`mock` | `live`). Default `mock` di dev.
- MSW membungkus transport FE; service layer tidak perlu tahu mock vs live.
- Tokens demo:
  - Login: `identifier=demo`, `password=demo1234`.
  - Reset: `token=demo-reset`. Lain invalid.
  - Invitation: `demo-aktif` valid, `kedaluwarsa` expired, lain invalid.
- Saat backend publish OpenAPI: hapus `src/mocks/`, ganti fetch wrapper di service dengan generated client.
