// Owns the slug allowlist for the /app catch-all route. Slugs without an
// entry resolve to a 404 shell state. New shell navigation entries must
// add a placeholder here or the corresponding test will fail.
export const SHELL_PLACEHOLDER_ROUTES = {
  riwayat: 'Riwayat',
  'bank-soal': 'Bank Soal',
  template: 'Template',
  generate: 'Generate lembar',
  profil: 'Profil',
  plan: 'Paket & kuota',
  kelas: 'Kelas',
  analitik: 'Analitik',
} as const;

export type ShellPlaceholderSlug = keyof typeof SHELL_PLACEHOLDER_ROUTES;
