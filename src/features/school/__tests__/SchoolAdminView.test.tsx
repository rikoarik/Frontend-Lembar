import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminPanelProvider } from '@/src/features/admin/adminPanelState';
import { SchoolAdminView } from '../SchoolAdminView';
import { schoolService } from '@/src/services/school/schoolService';

vi.mock('next/navigation', () => ({
  usePathname: () => '/school/admin/guru',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/src/services/school/schoolService', () => ({
  schoolService: {
    audit: vi.fn(),
    billing: vi.fn(),
    dashboard: vi.fn(),
    members: vi.fn(),
    memberSuspend: vi.fn(),
    memberUnsuspend: vi.fn(),
    removeMember: vi.fn(),
    usage: vi.fn(),
    settings: vi.fn(),
    updateSettings: vi.fn(),
    invitations: vi.fn(),
    cancelInvitation: vi.fn(),
    notifications: vi.fn(),
  },
}));

const membersMock = vi.mocked(schoolService.members);

function renderGuru() {
  return render(
    <AdminPanelProvider panelId="school-admin-test">
      <SchoolAdminView section="guru" />
    </AdminPanelProvider>,
  );
}

async function runMembersFetch() {
  await new Promise((resolve) => setTimeout(resolve, 350));
}

describe('SchoolAdminView guru data states', () => {

  it('shows an accessible loading skeleton while members are fetching', () => {
    membersMock.mockReturnValue(new Promise(() => {}));

    renderGuru();

    expect(
      screen.getByRole('status', { name: /memuat daftar anggota sekolah/i }),
    ).toBeInTheDocument();
  });

  it('shows an informative accessible empty state when the member list is empty', async () => {
    membersMock.mockResolvedValue({
      ok: true,
      value: { data: [], meta: { total: 0, page: 1, limit: 20, pages: 1 } },
    });

    renderGuru();
    await runMembersFetch();

    expect(
      await screen.findByRole('status', { name: /belum ada anggota sekolah/i }),
    ).toHaveTextContent(/undang guru pertama/i);
  });

  it('shows an accessible error state and retries the members request', async () => {
    membersMock
      .mockResolvedValueOnce({
        ok: false,
        error: {
          code: 'NETWORK',
          safeMessage: 'Tidak dapat terhubung.',
          retryable: true,
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        value: { data: [], meta: { total: 0, page: 1, limit: 20, pages: 1 } },
      });

    renderGuru();
    await runMembersFetch();

    expect(
      await screen.findByRole('alert', { name: /gagal memuat anggota sekolah/i }),
    ).toHaveTextContent('Tidak dapat terhubung.');

    await userEvent.click(screen.getByRole('button', { name: /coba lagi/i }));

    await waitFor(() => expect(membersMock).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByRole('status', { name: /belum ada anggota sekolah/i }),
    ).toBeInTheDocument();
  });
});

describe('SchoolAdminView honest contract rendering', () => {
  it('replaces unknown school metadata with neutral Indonesian labels', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue({ ok: true, value: {
      workspace: { name: 'SD Uji', level: 'unknown' }, memberCount: 0, members: [],
      usage: { plan: 'unknown', generationsUsedThisMonth: 0, monthlyLimit: 10 },
    } as never });
    render(<AdminPanelProvider panelId="summary-labels"><SchoolAdminView /></AdminPanelProvider>);
    expect(await screen.findByText('Belum tersedia · Belum tersedia')).toBeInTheDocument();
    expect(screen.queryByText(/unknown/i)).not.toBeInTheDocument();

    vi.mocked(schoolService.settings).mockResolvedValue({ ok: true, value: {
      name: 'SD Uji', slug: 'sd-uji', level: 'unknown', plan: 'unknown', seats: 1, renewsAt: null,
    } as never });
    render(<AdminPanelProvider panelId="settings-labels"><SchoolAdminView section="pengaturan" /></AdminPanelProvider>);
    expect(await screen.findByText('Level: Belum tersedia')).toBeInTheDocument();
    expect(screen.getByText('Paket: Belum tersedia')).toBeInTheDocument();
  });

  it('does not label live Guru or Penggunaan tables as data preview', async () => {
    membersMock.mockResolvedValue({ ok: true, value: { data: [{ id: 'm1', email: 'guru@uji.id', name: 'Guru Uji', role: 'teacher', state: 'active', joinedAt: '', lastActiveAt: null }], meta: { total: 1, page: 1, limit: 20, pages: 1 } } });
    const guru = renderGuru();
    expect(await screen.findByText('Guru Uji')).toBeInTheDocument();
    expect(screen.queryByText(/data preview/i)).not.toBeInTheDocument();
    guru.unmount();
    vi.mocked(schoolService.usage).mockResolvedValue({ ok: true, value: { quotaUsed: 1, quotaLimit: 10, breakdown: [{ userId: 'm1', email: 'guru@uji.id', name: 'Guru Uji', used: 1 }], trend: [] } });
    render(<AdminPanelProvider panelId="usage-live"><SchoolAdminView section="penggunaan" /></AdminPanelProvider>);
    expect(await screen.findByText('Kuota dipakai')).toBeInTheDocument();
    expect(screen.queryByText(/data preview/i)).not.toBeInTheDocument();
  });

  it('shows a member email only once when the name is missing or identical', async () => {
    membersMock.mockResolvedValue({ ok: true, value: { data: [
      { id: 'm1', email: 'sama@uji.id', name: 'sama@uji.id', role: 'teacher', state: 'active', joinedAt: '', lastActiveAt: null },
      { id: 'm2', email: 'kosong@uji.id', name: undefined, role: 'teacher', state: 'active', joinedAt: '', lastActiveAt: null },
    ], meta: { total: 2, page: 1, limit: 20, pages: 1 } } });
    renderGuru();
    expect(await screen.findByText('sama@uji.id')).toBeInTheDocument();
    expect(screen.getAllByText('sama@uji.id')).toHaveLength(1);
    expect(screen.getAllByText('kosong@uji.id')).toHaveLength(1);
  });

  it('uses Indonesian wording for pending invitations and notification statuses', async () => {
    vi.mocked(schoolService.invitations).mockResolvedValue({ ok: true, value: [] });
    const invitations = render(<AdminPanelProvider panelId="invitations-label"><SchoolAdminView section="undangan" /></AdminPanelProvider>);
    expect(await screen.findByText(/tidak ada undangan menunggu/i)).toBeInTheDocument();
    expect(screen.queryByText(/pending/i)).not.toBeInTheDocument();
    invitations.unmount();
    vi.mocked(schoolService.notifications).mockResolvedValue({ ok: true, value: { data: [], meta: { total: 0, page: 1, limit: 20, pages: 1 } } });
    render(<AdminPanelProvider panelId="notification-label"><SchoolAdminView section="notifikasi" /></AdminPanelProvider>);
    expect(screen.getByRole('button', { name: 'Menunggu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terkirim' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gagal' })).toBeInTheDocument();
  });
  it('keeps billing failure visible without active or paid claims', async () => {
    vi.mocked(schoolService.billing).mockResolvedValue({
      ok: false,
      error: { code: 'NETWORK', safeMessage: 'Billing tidak dapat dijangkau.', retryable: true },
    });

    render(
      <AdminPanelProvider panelId="school-billing-test">
        <SchoolAdminView section="billing" />
      </AdminPanelProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Billing tidak dapat dijangkau.');
    expect(screen.queryByText(/lunas \/ aktif/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/status: aktif/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /unduh faktur/i })).not.toBeInTheDocument();
  });

  it('renders billing seat count and cycle start using the actual billing contract', async () => {
    vi.mocked(schoolService.billing).mockResolvedValue({
      ok: true,
      value: {
        workspaceId: 'workspace-1',
        plan: 'pro',
        seatCount: 7,
        generationsUsedThisMonth: 18,
        monthlyLimit: null,
        billingCycleStartedAt: '2026-08-01T00:00:00.000Z',
      },
    });

    render(
      <AdminPanelProvider panelId="school-billing-contract-test">
        <SchoolAdminView section="billing" />
      </AdminPanelProvider>,
    );

    expect(await screen.findByText('7 Guru')).toBeInTheDocument();
    expect(screen.getByText('Mulai Siklus Billing')).toBeInTheDocument();
    expect(screen.getByText(/tidak terbatas/i)).toBeInTheDocument();
  });

  it('renders unlimited usage without a misleading progress bar', async () => {
    vi.mocked(schoolService.usage).mockResolvedValue({
      ok: true,
      value: { quotaUsed: 12, quotaLimit: 0, breakdown: [], trend: [] },
    });

    render(
      <AdminPanelProvider panelId="school-usage-test">
        <SchoolAdminView section="penggunaan" />
      </AdminPanelProvider>,
    );

    expect(await screen.findByText(/12 \/ tidak terbatas/i)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows a safe fallback for an unknown section', () => {
    render(
      <AdminPanelProvider panelId="school-unknown-test">
        <SchoolAdminView section="tidak-ada" />
      </AdminPanelProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/halaman tidak ditemukan/i);
  });

  it('renders a non-string audit target safely', async () => {
    vi.mocked(schoolService.audit).mockResolvedValue({
      ok: true,
      value: {
        data: [{
          id: 'audit-1', at: '2026-08-01', actor: 'Admin', action: 'update',
          target: { id: 'member-1' } as unknown as string, metadata: null,
        }],
        meta: { total: 1, page: 1, limit: 20, pages: 1 },
      },
    });

    render(
      <AdminPanelProvider panelId="school-audit-safe-test">
        <SchoolAdminView section="audit" />
      </AdminPanelProvider>,
    );

    expect(await screen.findByText('{"id":"member-1"}')).toBeInTheDocument();
  });
});
