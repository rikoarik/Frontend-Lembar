# Security default

- Tidak menyimpan token/sesi di `localStorage`/`sessionStorage`. Cookie HttpOnly otoritas backend.
- Tidak ada share token/signed URL di analytics/referrer/log.
- HTML dari AI/sumber tidak dirender mentah.
- `credentials: 'include'` saja; FE tidak pernah membaca cookie.
- `Idempotency-Key` hanya di memory submit hook.
- CSP, security headers, dan dependency scanning adalah CI gate. Tidak melewati.
- Middleware/proxy FE hanya UX gate; otorisasi sebenarnya di backend.
- External link: `rel="noopener noreferrer"` di mana relevan.
- Tidak pernah log email/phone/name.
