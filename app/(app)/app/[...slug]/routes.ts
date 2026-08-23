export const SHELL_REDIRECT_ROUTES = {
  profil: '/app/pengaturan/profil',
  plan: '/app/pengaturan/langganan',
} as const;

export type ShellRedirectSlug = keyof typeof SHELL_REDIRECT_ROUTES;
