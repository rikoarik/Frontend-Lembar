# Content Design and UI Copy

## CMS ownership

- Product/content rules in this document remain authoritative over editable CMS fields.
- Superadmin may edit supported marketing fields but cannot publish an undecided price,
  fabricated claim, fake proof, or unsafe CTA destination.
- CMS copy is plain structured text plus supported emphasis/link marks; no raw HTML.
- Global navigation/footer labels and CTA registry have stable IDs/tracking keys even when
  visible labels change.
- Fallback seed is production copy, not placeholder lorem ipsum.

## Voice

`lembar` sounds like a calm, competent colleague. It is direct without being curt and honest
about automation without technical jargon.

- Address user with `Anda` in UI and public copy unless brand review changes it.
- Use sentence case.
- Prefer verbs: `Buat`, `Tinjau`, `Simpan`, `Finalkan`, `Cetak`, `Unduh`, `Bagikan`.
- Explain consequence before technical reason.
- Give next action in every recoverable error.

## Product vocabulary

| Use | Meaning | Avoid |
| --- | --- | --- |
| Lembar | assessment document aggregate | quiz when print exam is meant |
| Draft | editable AI-assisted version | hasil final |
| Final | immutable reviewed version | selesai when state is ambiguous |
| Soal | question/item | konten AI |
| Sumber materi | catalog/PDF grounding | knowledge base in teacher UI |
| Tinjau | teacher review | approve AI blindly |
| Buat ulang | regenerate selected item | refresh magic |
| Riwayat | saved assessments | archive unless archived state |
| Bank Soal | private saved items | Bank Publik in MVP |
| Template | saved generation configuration | preset AI |
| Penggunaan | allowance/usage | token/credit unless approved term |

## AI language

Use:

- `AI membantu membuat draft berdasarkan pilihan dan sumber Anda.`
- `Periksa jawaban, bahasa, dan dukungan sumber sebelum final.`
- `Sebagian soal perlu ditinjau lebih lanjut.`

Avoid:

- `100% akurat`, `pasti sesuai`, `resmi`, `tanpa perlu diperiksa`;
- `AI berpikir`, chain-of-thought language, model/provider names;
- anthropomorphic apologies repeated on every error;
- magic, revolutionary, smartest, instant when latency is variable.

## Labels from the generate form

- `Sumber materi`
- `Kelas`
- `Kurikulum`
- `Mata Pelajaran`
- `Materi`
- `Jenis Lembar`
- `Tingkat Kesulitan`
- `Jumlah Soal`
- `Mode Review`
- `Fokus / Tujuan Guru (opsional)`
- `Contoh Soal (opsional)`
- `Ringkasan Konfigurasi`

Descriptions use one sentence; do not restate label.

## Button rules

- Button states outcome, not vague `Lanjut` when possible.
- Destructive button names action: `Hapus PDF`, `Cabut tautan`, `Batalkan draft`.
- Loading label preserves action: `Membuat draft…`, `Menyimpan…`.
- `Kembali` must not silently discard; warn when unsaved.

## Status labels

| Internal | UI label |
| --- | --- |
| draft | Draft |
| queued | Dalam antrean |
| processing | Diproses |
| review | Perlu ditinjau |
| final | Final |
| partially_failed | Sebagian selesai |
| failed | Gagal diproses |
| archived | Diarsipkan |
| expired | Kedaluwarsa |
| revoked | Dicabut |

## Error formula

`What happened` + `what was preserved/affected` + `what to do` + optional request ID.

Examples:

| Context | Copy direction |
| --- | --- |
| Invalid PDF | `PDF ini belum dapat dipakai. Pilih file PDF yang tidak terkunci dan berada dalam batas ukuran.` |
| Source extraction | `Teks pada PDF belum cukup terbaca. Draft belum dibuat dan penggunaan Anda tidak berkurang. Coba PDF lain.` |
| Generation retryable | `Draft belum berhasil dibuat. Konfigurasi Anda tersimpan dan dapat dicoba lagi.` |
| Save conflict | `Versi ini berubah di tempat lain. Salin perubahan Anda atau muat versi terbaru sebelum melanjutkan.` |
| Permission | `Anda tidak memiliki akses ke lembar ini di workspace aktif.` |
| Share expired | `Tautan ini sudah tidak tersedia. Minta pemilik lembar membuat tautan baru.` |
| Rate limit | `Terlalu banyak percobaan. Coba lagi setelah {time}.` |

Never expose stack trace, provider response, storage key, account existence, or secret.

## Empty states

| Screen | Headline | Action |
| --- | --- | --- |
| Dashboard new | `Belum ada lembar` | `Buat lembar pertama` |
| History filtered | `Tidak ada hasil untuk filter ini` | `Hapus filter` |
| Bank | `Belum ada soal tersimpan` | explain save from review |
| Template | `Belum ada template` | create from generation config |
| School teachers | `Belum ada guru di workspace ini` | `Undang guru` |

Empty state does not need illustration unless it improves comprehension.

## Confirmation copy

Finalization:

```text
Finalkan versi ini?
Versi final tidak dapat diedit langsung. Perubahan berikutnya akan dibuat sebagai draft baru.
```

Revoke share:

```text
Cabut tautan ini?
Siapa pun yang memiliki tautan tidak dapat lagi membuka paket yang dibagikan.
```

Delete source:

```text
Hapus PDF “{safe display name}”?
PDF tidak dapat dipakai untuk draft baru. Retensi salinan pemrosesan mengikuti kebijakan data.
```

## Dates, numbers, and names

- Locale `id-ID`; timezone explicit in server logic.
- UI date: `17 Juli 2026`; compact table may use `17 Jul 2026`.
- Time: `16.30`; add timezone in audit/export context.
- Number: `1.250`, decimal `1,5`; currency only after pricing decision.
- Academic year: `2026/2027`; semester uses configured label.
- Never infer honorific `Bu/Pak` from name/profile unless user selected preference.

## Truncation

- Do not truncate error, permission, finalization, or pricing meaning.
- Long material lists collapse with count and accessible expansion.
- File names can truncate visually but full safe name available on focus/tooltip.
- Buttons may wrap before critical label is shortened ambiguously.

## Copy review gate

- Correct product state and permission.
- No unsupported factual/official/accuracy claim.
- No private content in URL/telemetry.
- Indonesian grammar and terminology reviewed.
- Long/short fixtures tested.
- Error has recovery or honest terminal state.
