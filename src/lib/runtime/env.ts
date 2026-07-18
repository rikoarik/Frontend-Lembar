type Env = Record<string, string | undefined>;

export type AppEnv = 'development' | 'preview' | 'production';
export type ApiMode = 'mock' | 'live';

export type PublicRuntimeConfig = {
  appEnv: AppEnv;
  appUrl: string;
  apiBaseUrl: string;
  apiMode: ApiMode;
  analyticsEnabled: boolean;
};

export type ServerRuntimeConfig = PublicRuntimeConfig & {
  nodeEnv: 'development' | 'test' | 'production';
};

const DEFAULT_PUBLIC_CONFIG: PublicRuntimeConfig = {
  appEnv: 'development',
  appUrl: 'http://localhost:3000',
  apiBaseUrl: '/v1',
  apiMode: 'mock',
  analyticsEnabled: false,
};

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function booleanFromEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function safeUrl(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  if (value.startsWith('/')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : fallback;
  } catch {
    return fallback;
  }
}

export function loadPublicRuntimeConfig(env: Env = process.env): PublicRuntimeConfig {
  return {
    appEnv: oneOf(env.NEXT_PUBLIC_APP_ENV, ['development', 'preview', 'production'], DEFAULT_PUBLIC_CONFIG.appEnv),
    appUrl: safeUrl(env.NEXT_PUBLIC_APP_URL, DEFAULT_PUBLIC_CONFIG.appUrl),
    apiBaseUrl: safeUrl(env.NEXT_PUBLIC_API_BASE_URL, DEFAULT_PUBLIC_CONFIG.apiBaseUrl),
    apiMode: oneOf(env.NEXT_PUBLIC_API_MODE, ['mock', 'live'], DEFAULT_PUBLIC_CONFIG.apiMode),
    analyticsEnabled: booleanFromEnv(
      env.NEXT_PUBLIC_ANALYTICS_ENABLED,
      DEFAULT_PUBLIC_CONFIG.analyticsEnabled,
    ),
  };
}

export function loadServerRuntimeConfig(env: Env = process.env): ServerRuntimeConfig {
  return {
    ...loadPublicRuntimeConfig(env),
    nodeEnv: oneOf(env.NODE_ENV, ['development', 'test', 'production'], 'development'),
  };
}
