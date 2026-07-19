import { describe, expect, it } from 'vitest';
import { loadPublicRuntimeConfig, loadServerRuntimeConfig } from '../env';

describe('loadPublicRuntimeConfig', () => {
  it('returns safe defaults when env is empty', () => {
    const config = loadPublicRuntimeConfig({});
    expect(config).toEqual({
      appEnv: 'development',
      appUrl: 'http://localhost:3000',
      apiBaseUrl: '/v1',
      apiMode: 'mock',
      analyticsEnabled: false,
    });
  });

  it('honours NEXT_PUBLIC_API_MODE=live when valid', () => {
    const config = loadPublicRuntimeConfig({ NEXT_PUBLIC_API_MODE: 'live' });
    expect(config.apiMode).toBe('live');
  });

  it('falls back when NEXT_PUBLIC_API_MODE is unknown', () => {
    const config = loadPublicRuntimeConfig({ NEXT_PUBLIC_API_MODE: 'sneaky' });
    expect(config.apiMode).toBe('mock');
  });

  it('falls back when NEXT_PUBLIC_APP_URL is not a valid URL', () => {
    const config = loadPublicRuntimeConfig({ NEXT_PUBLIC_APP_URL: 'not-a-url' });
    expect(config.appUrl).toBe('http://localhost:3000');
  });

  it('falls back when NEXT_PUBLIC_API_BASE_URL is malformed', () => {
    const config = loadPublicRuntimeConfig({ NEXT_PUBLIC_API_BASE_URL: '::::' });
    expect(config.apiBaseUrl).toBe('/v1');
  });

  it('parses NEXT_PUBLIC_ANALYTICS_ENABLED correctly', () => {
    expect(loadPublicRuntimeConfig({ NEXT_PUBLIC_ANALYTICS_ENABLED: 'true' }).analyticsEnabled).toBe(true);
    expect(loadPublicRuntimeConfig({ NEXT_PUBLIC_ANALYTICS_ENABLED: 'false' }).analyticsEnabled).toBe(false);
    expect(loadPublicRuntimeConfig({ NEXT_PUBLIC_ANALYTICS_ENABLED: 'maybe' }).analyticsEnabled).toBe(false);
  });
});

describe('loadServerRuntimeConfig', () => {
  it('includes nodeEnv derived from NODE_ENV', () => {
    const config = loadServerRuntimeConfig({ NODE_ENV: 'production' });
    expect(config.nodeEnv).toBe('production');
  });

  it('returns safe defaults when env is empty', () => {
    const config = loadServerRuntimeConfig({});
    expect(config.nodeEnv).toBe('development');
    expect(config.appUrl).toBe('http://localhost:3000');
  });
});