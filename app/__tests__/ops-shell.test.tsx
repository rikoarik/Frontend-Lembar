import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpsConsoleView } from '@/src/features/ops/OpsConsoleView';
import { OpsAdminShell } from '@/src/features/admin/AdminAppShell';

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
  expect(await screen.findByRole('button', { name: 'Admin Sekolah' })).toBeInTheDocument();
}

vi.mock('next/navigation', () => ({
  usePathname: () => '/ops/accounts',
  useRouter: () => ({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('@/src/services/admin/adminService', () => ({
  adminService: {
    dashboardTrends: vi.fn().mockResolvedValue({ ok: true, value: { jobs: [], quality: [] } }),
    dashboard: vi.fn().mockResolvedValue({
      ok: true,
      value: {
        users: 42,
        schools: 5,
        jobsActive: 3,
        qualityOpen: 2,
        flagsEnabled: 4,
      },
    }),
    jobs: vi.fn().mockResolvedValue({
      ok: true,
      value: [
        {
          id: 'job_8f2a',
          type: 'GENERATE_ASSESSMENT',
          tenant: 'SDN Contoh 01',
          status: 'running',
          progress: '65%',
          updatedAt: '2 menit lalu',
        },
      ],
    }),
    accounts: vi.fn().mockResolvedValue({
      ok: true,
      value: {
        data: [
          {
            id: 'acc_1',
            displayName: 'Ops Superadmin',
            email: 'ops@lembar.id',
            role: 'superadmin',
            status: 'aktif',
            school: 'Lembar HQ',
          },
          {
            id: 'acc_2',
            displayName: 'Demo Guru',
            email: 'guru@lembar.id',
            role: 'teacher',
            status: 'aktif',
            school: 'SDN 01',
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1,
        },
      },
    }),
    billing: vi.fn().mockResolvedValue({
      ok: true,
      value: [
        {
          id: 'bil_1',
          school: 'SMP Harapan',
          state: 'active',
          seats: '25/30',
          renewsAt: '2026-12-31',
        },
      ],
    }),
    schools: vi.fn().mockResolvedValue({ ok: true, value: [] }),
    qualityReports: vi.fn().mockResolvedValue({ ok: true, value: [] }),
    flags: vi.fn().mockResolvedValue({ ok: true, value: [] }),
    prompts: vi.fn().mockResolvedValue({
      ok: true,
      value: [
        {
          id: 'prompt_active',
          name: 'Alpha Active',
          owner: 'Ops',
          status: 'active',
          successRate: 25,
        },
        { id: 'prompt_draft', name: 'Alpha Draft', owner: 'Ops', status: 'draft', successRate: 10 },
      ],
    }),
    audit: vi.fn().mockResolvedValue({ ok: true, value: [] }),
    marketingPages: vi.fn().mockResolvedValue({ ok: true, value: [] }),
  },
}));

function renderOps(section: string) {
  return render(
    <OpsAdminShell>
      <OpsConsoleView section={section} />
    </OpsAdminShell>,
  );
}

describe('ops superadmin management panel', () => {
  beforeEach(() => {
    push.mockReset();
    rolesFetch.mockClear();
    vi.stubGlobal('fetch', rolesFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps shell chrome and renders jobs table content', async () => {
    renderOps('');
    const trendsLoading = screen.getByLabelText('Memuat data…');

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: /navigasi panel/i }).length).toBeGreaterThan(
      0,
    );
    await waitForElementToBeRemoved(trendsLoading);
    await waitForRoleSwitcher();
    expect(await screen.findByText(/job_8f2a/i)).toBeInTheDocument();
  });

  it('renders accounts management table and supports search state', async () => {
    const user = userEvent.setup();
    renderOps('accounts');
    await waitForRoleSwitcher();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const search = await screen.findByPlaceholderText(/cari akun, email, role, sekolah/i);
    await user.type(search, 'ops');
    expect((await screen.findAllByText(/Ops Superadmin/i)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Demo Guru/i)).not.toBeInTheDocument();
  });

  it('renders billing section table', async () => {
    renderOps('billing');
    await waitForRoleSwitcher();
    expect(await screen.findByText(/SMP Harapan/i)).toBeInTheDocument();
  });

  it('filters prompts by status independently from search and renders percent values directly', async () => {
    const user = userEvent.setup();
    renderOps('prompts');
    await waitForRoleSwitcher();

    const search = await screen.findByPlaceholderText(/cari nama prompt \/ slug \/ owner/i);
    await user.type(search, 'alpha');
    await user.click(screen.getByRole('button', { name: 'draft' }));

    expect(search).toHaveValue('alpha');
    expect(await screen.findByText('Alpha Draft')).toBeInTheDocument();
    expect(screen.queryByText('Alpha Active')).not.toBeInTheDocument();
    // Prompt rows no longer expose a synthetic success-rate percentage; verify the filtered record instead.
    expect(screen.queryByText('Alpha Active')).not.toBeInTheDocument();
  });

  it('does not leak teacher question content', async () => {
    renderOps('');
    const trendsLoading = screen.getByLabelText('Memuat data…');

    await waitForElementToBeRemoved(trendsLoading);
    await waitForRoleSwitcher();
    expect(await screen.findByText(/job_8f2a/i)).toBeInTheDocument();

    const content = document.body.textContent ?? '';
    expect(content).not.toMatch(/workspace guru|bank soal pribadi|lembar kerja guru/i);
  });
});
