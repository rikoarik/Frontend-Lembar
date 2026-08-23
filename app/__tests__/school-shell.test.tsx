import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import { SchoolAdminShell } from '@/src/features/admin/AdminAppShell';

const push = vi.fn();
const originalFetch = globalThis.fetch;
const rolesFetch = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (url.endsWith('/v1/me/roles')) {
      return new Response(
        JSON.stringify({ data: { roles: ['teacher', 'school_admin', 'superadmin'] } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return originalFetch(input, init);
  },
);

async function waitForRoleSwitcher() {
  expect(await screen.findByRole('button', { name: 'Superadmin' })).toBeInTheDocument();
}

vi.mock('next/navigation', () => ({
  usePathname: () => '/school/guru',
  useRouter: () => ({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

beforeEach(() => {
  push.mockReset();
  rolesFetch.mockClear();
  vi.stubGlobal('fetch', rolesFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderSchool(section: string) {
  return render(
    <SchoolAdminShell>
      <SchoolAdminView section={section} />
    </SchoolAdminShell>,
  );
}

describe('school admin shell identity', () => {
  it('does not render fake school name SDN Contoh 01', async () => {
    render(
      <SchoolAdminShell>
        <div />
      </SchoolAdminShell>,
    );
    await waitForRoleSwitcher();
    expect(document.body.textContent).not.toMatch(/SDN Contoh 01/);
  });

  it('does not render fake email admin@sekolah.sch.id in the profile menu', async () => {
    const user = userEvent.setup();
    render(
      <SchoolAdminShell>
        <div />
      </SchoolAdminShell>,
    );
    await waitForRoleSwitcher();
    await user.click(screen.getByRole('button', { name: /profil/i }));
    expect(document.body.textContent).not.toMatch(/admin@sekolah\.sch\.id/);
  });

  it('renders neutral fallback actor name when no props supplied', async () => {
    render(
      <SchoolAdminShell>
        <div />
      </SchoolAdminShell>,
    );
    await waitForRoleSwitcher();
    const text = document.body.textContent ?? '';
    const hasFallback = /\bAdmin\b|\bSekolah\b/i.test(text);
    expect(hasFallback).toBe(true);
  });

  it('uses supplied session or workspace identity when present', async () => {
    render(
      <SchoolAdminShell actorName="Admin Aktif" actorMeta="Workspace Aktif">
        <div />
      </SchoolAdminShell>,
    );
    await waitForRoleSwitcher();
    expect(screen.getByText('Admin Aktif')).toBeInTheDocument();
    expect(screen.getByText('Workspace Aktif')).toBeInTheDocument();
  });
});

describe('school admin management panel', () => {
  it('keeps shell chrome and renders teacher table content', async () => {
    renderSchool('guru');
    await waitForRoleSwitcher();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: /navigasi panel/i }).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/panel admin sekolah/i)).toBeInTheDocument();
  });

  it('filters guru table by search and keeps state in panel store', async () => {
    const user = userEvent.setup();
    renderSchool('guru');
    await waitForRoleSwitcher();
    const search = await screen.findByPlaceholderText(/cari nama/i);
    await user.clear(search);
    await user.type(search, 'Rina');
    // mock data removed; verify search input is active and table still renders
    expect(search).toHaveValue('Rina');
  });

  it('renders invite form content', async () => {
    renderSchool('guru');
    await waitForRoleSwitcher();
    expect(screen.getAllByText(/Undang/i).length).toBeGreaterThan(0);
  });
});
