import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpsProfileSection } from '../sections/OpsProfileSection';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

const ME = {
  data: {
    account: { id: 'acc-1', displayName: 'All Roles', email: 'allroles@test.com' },
    activeWorkspace: {
      id: 'ws-1',
      role: 'superadmin',
      permissions: ['platform.ops', 'school.manage', 'assessment.read'],
    },
  },
};

const SESSION = { data: { issuedAt: 1780000000, expiresAt: 1780500000, source: 'jwt' } };

function mockFetch(overrides: { me?: unknown; session?: Response } = {}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith('/v1/me/session')) {
      return (
        overrides.session ??
        new Response(JSON.stringify(SESSION), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    }
    if (url.endsWith('/v1/me')) {
      return new Response(JSON.stringify(overrides.me ?? ME), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response('{}', { status: 404 });
  });
}

describe('OpsProfileSection (FE-VER-02 F-3)', () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it('renders the real session identity instead of the hardcoded ops literal', async () => {
    vi.stubGlobal('fetch', mockFetch());
    render(<OpsProfileSection setToast={vi.fn()} />);

    expect(await screen.findByText('All Roles')).toBeInTheDocument();
    expect(screen.getByText('allroles@test.com')).toBeInTheDocument();
    expect(screen.queryByText('ops@lembar.id')).not.toBeInTheDocument();
    expect(screen.queryByText('Ops Superadmin')).not.toBeInTheDocument();
    expect(screen.queryByText('FULL_CONTROL')).not.toBeInTheDocument();
    expect(screen.getByText(/platform\.ops/)).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it('derives "Sesi Aktif Sejak" from the JWT iat claim', async () => {
    vi.stubGlobal('fetch', mockFetch());
    render(<OpsProfileSection setToast={vi.fn()} />);

    await screen.findByText('All Roles');
    const expected = new Date(1780000000 * 1000).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    expect(screen.getByText('Sesi Aktif Sejak').parentElement?.textContent).toContain(expected);

    vi.unstubAllGlobals();
  });

  it('falls back to an em dash when the session claims are unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        session: new Response(JSON.stringify({ error: { code: 'AUTH_REQUIRED' } }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      }),
    );
    render(<OpsProfileSection setToast={vi.fn()} />);

    await screen.findByText('All Roles');
    await waitFor(() =>
      expect(screen.getByText('Sesi Aktif Sejak').parentElement?.textContent).toContain('—'),
    );

    vi.unstubAllGlobals();
  });
});
