import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OpsAdminShell } from '@/src/features/admin/AdminAppShell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/ops/profile',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

function fetchWith(body: unknown, status = 200) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith('/v1/me/roles')) {
      return new Response(JSON.stringify({ data: { roles: ['superadmin'] } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.endsWith('/v1/me')) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('{}', { status: 404 });
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('ops shell actor identity (FE-VER-02 F-3)', () => {
  it('shows the signed-in account in the shell instead of the hardcoded ops literal', async () => {
    vi.stubGlobal(
      'fetch',
      fetchWith({
        data: {
          account: { displayName: 'All Roles', email: 'allroles@test.com' },
          activeWorkspace: { role: 'superadmin' },
        },
      }),
    );
    render(
      <OpsAdminShell>
        <div />
      </OpsAdminShell>,
    );

    expect(await screen.findByText('All Roles')).toBeInTheDocument();
    expect(screen.getAllByText('allroles@test.com').length).toBeGreaterThan(0);
    expect(screen.queryByText('Ops Superadmin')).not.toBeInTheDocument();
    expect(screen.queryByText('platform · least privilege')).not.toBeInTheDocument();
  });

  it('falls back to a neutral role label when the identity cannot be loaded', async () => {
    vi.stubGlobal('fetch', fetchWith({ error: { code: 'AUTH_REQUIRED' } }, 401));
    render(
      <OpsAdminShell>
        <div />
      </OpsAdminShell>,
    );

    await waitFor(() => expect(screen.getAllByText('Superadmin').length).toBeGreaterThan(0));
    expect(screen.queryByText('Ops Superadmin')).not.toBeInTheDocument();
  });
});
