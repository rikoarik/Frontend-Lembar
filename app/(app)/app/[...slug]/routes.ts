// Owns the slug allowlist for the /app catch-all route. Dedicated pages must
// NOT remain here once implemented. Remaining placeholders:
export const SHELL_PLACEHOLDER_ROUTES = {
  profil: 'Profil',
  plan: 'Paket & kuota',
  'pengaturan/workspace': 'Workspace',
  'pengaturan/langganan': 'Paket & kuota',
} as const;

export type ShellPlaceholderSlug = keyof typeof SHELL_PLACEHOLDER_ROUTES;
