import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  APP_DYNAMIC_PREFIXES,
  APP_LEGACY_REDIRECTS,
  APP_STATIC_ROUTES,
  isKnownAppPath,
} from '@/src/lib/routing/appRoutes';

const APP_DIR = join(process.cwd(), 'app', '(app)', 'app');

/**
 * Walk `app/(app)/app` and derive the routes Next actually serves, so a new
 * page that is not mirrored in `APP_STATIC_ROUTES` / `APP_DYNAMIC_PREFIXES`
 * fails here instead of silently 404-ing in production (the proxy rewrites any
 * `/app/*` path missing from those lists).
 */
function deriveRoutes(): { static: string[]; dynamic: string[] } {
  const staticRoutes: string[] = [];
  const dynamicPrefixes: string[] = [];

  const walk = (dir: string, segments: string[]) => {
    // The directory itself may be a route (root `/app`, or a group's page).
    // A path containing a dynamic segment (`[id]`, `[...slug]`) is not a static
    // route — it is covered by APP_DYNAMIC_PREFIXES instead.
    const isDynamic = segments.some((segment) => segment.startsWith('['));
    if (!isDynamic && readdirSync(dir).includes('page.tsx')) {
      staticRoutes.push('/app' + (segments.length ? '/' + segments.join('/') : ''));
    }

    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (!statSync(full).isDirectory()) continue;

      // Route groups `(foo)` and private folders `_foo` do not add a path segment.
      const isGroup = entry.startsWith('(') || entry.startsWith('_');
      const nextSegments = isGroup ? segments : [...segments, entry];

      // A catch-all folder `[...slug]` means the parent path is dynamic.
      if (entry.startsWith('[') && segments.length) {
        dynamicPrefixes.push('/app/' + segments.join('/') + '/');
      }
      walk(full, nextSegments);
    }
  };

  walk(APP_DIR, []);
  return { static: staticRoutes.sort(), dynamic: dynamicPrefixes.sort() };
}

describe('appRoutes allow-list matches the filesystem', () => {
  it('lists every real /app page and nothing invented', () => {
    const { static: derived } = deriveRoutes();
    const declared = [...APP_STATIC_ROUTES].sort();

    // Every declared route must exist as a page.tsx.
    const phantom = declared.filter((route) => !derived.includes(route));
    expect(phantom, `declared but no page.tsx: ${phantom.join(', ')}`).toEqual([]);

    // Every real page must be declared, or the proxy would 404 it in production.
    const missing = derived.filter((route) => !declared.includes(route));
    expect(missing, `page.tsx exists but not in APP_STATIC_ROUTES: ${missing.join(', ')}`).toEqual(
      [],
    );
  });

  it('declares every dynamic prefix that has a catch-all folder', () => {
    const { dynamic: derived } = deriveRoutes();
    const missing = derived.filter((prefix) => !APP_DYNAMIC_PREFIXES.includes(prefix));
    expect(missing, `dynamic segment not declared: ${missing.join(', ')}`).toEqual([]);
  });

  it('recognises the declared routes and rejects an unknown path', () => {
    for (const route of APP_STATIC_ROUTES) {
      expect(isKnownAppPath(route), `${route} should be known`).toBe(true);
    }
    for (const route of APP_LEGACY_REDIRECTS) {
      expect(isKnownAppPath(route), `${route} (legacy redirect) should be known`).toBe(true);
    }
    for (const prefix of APP_DYNAMIC_PREFIXES) {
      expect(isKnownAppPath(`${prefix}abc-123`), `${prefix}abc-123 should be known`).toBe(true);
    }

    // BUG-25: these are the exact soft-404 URLs from the audit.
    expect(isKnownAppPath('/app/zzz-unknown')).toBe(false);
    expect(isKnownAppPath('/app/tidak-ada-halaman')).toBe(false);
  });
});
