# Error handling reusable

- Domain error type = `<Domain>Error` dengan `code`, `safeMessage`, `hint`, `retryable`, `requestId?`, `fieldErrors?`, `retryAfterMs?`.
- `errorMapping.ts` adalah satu-satunya tempat copy Indonesia untuk error. Komponen tidak menulis string pesan sendiri.
- Lokasi tampil:
  - `FormStatus` (region `role="status"`/`role="alert"`) untuk pesan non-field.
  - `FormField` (`aria-describedby` → `FieldError`) untuk pesan per-field.
- Tidak membedakan pesan untuk identifier terdaftar/tidak (enumeration-safe).
- Tidak ada copy klise AI (“Hmm…”, “Mari kita coba lagi”). Bahasa Indonesia aktif dan netral.
- 5xx/unknown: tampilkan `requestId` + link bantuan. Tidak pernah menampilkan raw error/stack.
