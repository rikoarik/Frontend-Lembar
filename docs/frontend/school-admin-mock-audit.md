# School Admin Mock / Placeholder Audit

Repo: `/home/hermes/Projects/Frontend-Lembar`  
Branch checked: `dev`  
Scope: school-admin pages/components/services only. No build run.

## Findings

### 1. `src/services/school/schoolService.ts` — development mock fallback still active outside production

- Lines 49-77 define `MOCK_MEMBERS`.
  - Mock fields: `id`, `name`, `email`, `role`, `state`, `joinedAt`, `lastActiveAt`.
  - Concrete values include `mem_1`, `Siti Aminah`, `siti@sdn1.sch.id`, `mem_2`, `Rina Kartika`, `mem_3`, `Budi Santoso`.
- Lines 118-127 return mock paginated member data when `/v1/school/members*` fails in non-production.
  - Mock response fields: `data`, `meta.page`, `meta.limit`, `meta.total`, `meta.totalPages`.
  - Note: `meta.totalPages` does not match the frontend type/UI expectation `meta.pages` from lines 175-178 and `SchoolAdminView.tsx` lines 337-340.
- Lines 129-133 return a mock dashboard when `/v1/school/dashboard*` fails in non-production.
  - Mock response fields: `stats.totalMembers`, `stats.activeMembers`, `stats.quotaUsed`, `stats.quotaLimit`, `stats.totalAssessments`, `workspace.name`, `workspace.plan`, `workspace.level`.
  - Note: this shape does not match `SchoolDashboard` on lines 280-294, which expects `workspace`, `members`, `memberCount`, and `usage`.

Impact: local/dev school admin can silently look partially functional even when the API is unavailable, and the fallback shape can break ringkasan/member pagination behavior.

### 2. `src/features/school/SchoolAdminView.tsx` — billing section is mostly static / no-op

- Lines 644-670 define `SchoolInvoice` and `SAMPLE_INVOICES`.
  - Static invoice fields: `id`, `date`, `description`, `amount`, `paymentMethod`, `status`.
  - Concrete values: `INV-SCH-2026-001`, `INV-SCH-2025-001`, `Transfer Bank BCA`, `paid`, amounts `4500000` and `2700000`.
- Lines 717-726: **Unduh Faktur Terakhir** only calls `setToast('Permintaan unduh faktur terakhir sedang diproses.')`; no download/API action.
- Lines 727-739: **Tambah Lisensi Guru** only shows a contact toast with static `sales@lembar.id`; no seat/license request flow.
- Lines 765-768: payment status card is hardcoded to `Lunas / Aktif` and `Tidak ada tagihan tertunggak`.
- Line 777: subscription detail pill is hardcoded to `Status: Aktif`.
- Lines 791-793: school level fallback is hardcoded to `SD / SMP / SMA`.
- Line 799: monthly AI limit is hardcoded to `Unlimited Terpusat`.
- Line 805: billing method is hardcoded to `Faktur Tahunan (Invoice)`.
- Lines 814-823: package benefits are static marketing copy, not API-backed entitlements/features.
- Lines 830-897 render `SAMPLE_INVOICES` in the invoice table.
- Lines 884-888: per-invoice **Unduh Faktur** only calls `setToast`; no actual PDF/download endpoint.

Impact: `/school/billing` displays real `settings` only for name/plan/seats/renewal, but invoices, payment status, billing method, entitlements, and all billing actions are placeholders.

### 3. `src/features/admin/AdminAppShell.tsx` — school shell identity is static

- Lines 30-33 configure the school admin shell brand/subtitle/nav.
- Lines 43-44 hardcode `actorName="Admin Sekolah"` and `actorMeta="SDN Contoh 01"`.

Impact: the school admin shell does not show the logged-in admin identity or workspace name; it can show the sample school even for another workspace.

### 4. `src/features/admin/AdminChrome.tsx` — shared admin shell has school-facing static fallbacks

Used by `SchoolAdminShell`.

- Lines 663-664 default school actor fallback to `Admin Sekolah` and `SDN Contoh 01`.
- Line 840 hardcodes school profile email fallback to `admin@sekolah.sch.id`.
- Lines 355 and 486-488 default every table footer to `Data preview` unless callers override it; `SchoolAdminView.tsx` does not override it for guru/library/audit/billing/invitations/notifications tables.

Impact: school admin tables and profile UI still communicate preview/mock state even when rows are API-backed.

### 5. `src/features/school/SchoolAdminView.tsx` — minor placeholder copy

- Line 419 uses example invite email placeholder `guru@sekolah.sch.id`.
- Lines 478-482 render generic `Data tidak tersedia` if usage request succeeds without data.
- Lines 1313-1316 render `Belum ada notifikasi.` for an empty notifications result.

Impact: these are acceptable empty/input states, not blocking mocks, but should stay copy-only and not be used as fake data.

## Pages / routes touched by findings

- `/school` → `SectionRingkasan`, API-backed but affected by service dashboard fallback.
- `/school/guru` → API-backed but affected by service member fallback and shared `Data preview` table footer.
- `/school/undang` → API-backed invite action; only input placeholder is static.
- `/school/undangan` → API-backed but shared `Data preview` table footer.
- `/school/penggunaan` → API-backed, generic empty state only.
- `/school/billing` → highest mock/static concentration.
- `/school/pengaturan` → API-backed settings form.
- `/school/library` → API-backed but shared `Data preview` table footer.
- `/school/audit` → API-backed but shared `Data preview` table footer.
- `/school/notifikasi` → API-backed but shared `Data preview` table footer.

## Recommended next task split

1. **SCHOOL-ADMIN-BILLING-LIVE**
   - Replace `SAMPLE_INVOICES`, hardcoded payment status, billing method, entitlements, and invoice download toasts with live billing/subscription API contract.
   - If no backend exists, hide invoice/download controls behind disabled states with explicit “Belum tersedia” copy instead of fake invoice rows.

2. **SCHOOL-ADMIN-SHELL-IDENTITY**
   - Load real current user/workspace identity for `SchoolAdminShell` / `AdminShell` actor display.
   - Remove `SDN Contoh 01` and `admin@sekolah.sch.id` fallbacks from runtime school admin UI.

3. **SCHOOL-SERVICE-MOCK-FALLBACK-REMOVAL**
   - Remove or test-gate non-production fallback in `schoolService.request`.
   - If local mocks are still required, move them behind explicit test/MSW fixtures and align fallback response shapes with `SchoolDashboard` and `SchoolMembersResult.meta.pages`.

4. **ADMIN-TABLE-FOOTER-COPY**
   - Change default `AdminDataTable` footer from `Data preview` to neutral live-safe copy, or require school admin callers to pass explicit footer text.

## Source code edits

None. This audit only added this report.
