# FE architecture

- Routes: `app/(auth|app|admin|marketing)/...`. Route group = organisasi UI, bukan batas otorisasi. Backend tetap memverifikasi.
- Domain logic di `src/features/<name>/` (UI, state, validation).
- Transport dan error mapping di `src/services/<name>/` (`*Service.ts`, `*Mutations.ts`, `*Errors.ts`, `errorMapping.ts`).
- Generated OpenAPI client milik backend. Saat BE siap, hanya `services/*` yang disentuh; tidak menyentuh komponen.
- Tipe bersama di `src/types/<name>.ts`. Tidak menulis ulang response interface di feature.
- Atomic imports: hindari barrel file besar di FE hot path.
- Komponen tidak pernah memanggil `fetch` langsung. Pakai service.
