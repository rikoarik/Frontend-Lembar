/**
 * Minimal translator contract shared by pure helpers (types/validation) so they
 * can stay locale-agnostic without importing next-intl into non-component code.
 * A `useTranslations(...)` result is structurally assignable to this type.
 */
export type Translate = (key: string, values?: Record<string, string | number | Date>) => string;
