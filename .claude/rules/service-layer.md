# Service layer

- Setiap domain network punya folder `src/services/<name>/` dengan minimal:
  - `<name>Service.ts` — tipis: fetch wrapper + Result<T, E>.
  - `<name>Errors.ts` — katalog kode error spesifik domain + types.
  - `errorMapping.ts` — kode → safeMessage, hint, retryable.
  - `<name>Mutations.ts` (opsional) — wrapper submit form (Idempotency-Key, retry-after).
- Gunakan `Result<T, E>` di service. Komponen tidak menangani `throw` mentah.
- `baseURL` dari `process.env.NEXT_PUBLIC_API_BASE_URL` (default `/v1`).
- Selalu `credentials: 'include'`. Selalu `Content-Type: application/json`. Tambah `Accept-Language: id`.
- Mutation: pasang `Idempotency-Key` (UUID, sekali per submit). Hold di memory hook.
- Mapping HTTP envelope menggunakan `shared/ERROR-CATALOG.md` sebagai source of truth.
- Reusable: `FormStatus` dan `FieldError` dipakai lintas domain. Tidak menulis ulang.
- `ponytail:` komentar menandai ceiling (mis. mock transport) dan jalur upgrade (mis. OpenAPI client).
