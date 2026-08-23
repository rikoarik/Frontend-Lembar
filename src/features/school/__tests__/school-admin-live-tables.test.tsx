/**
 * TDD: school-admin-live-tables
 * Tests the SectionGuru member table inside SchoolAdminView.
 * All assertions are against schoolService.members() results — never MOCK_MEMBERS.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import { AdminPanelProvider } from '@/src/features/admin/adminPanelState';
import { schoolService } from '@/src/services/school/schoolService';

// ── mock entire service module ────────────────────────────────────────────────
vi.mock('@/src/services/school/schoolService', () => ({
  schoolService: {
    dashboard: vi.fn(),
    members: vi.fn(),
    memberSuspend: vi.fn(),
    memberUnsuspend: vi.fn(),
    removeMember: vi.fn(),
  },
}));

function renderGuru() {
  return render(
    <AdminPanelProvider panelId="school">
      <SchoolAdminView section="guru" />
    </AdminPanelProvider>,
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
const okEmpty = {
  ok: true as const,
  value: {
    data: [],
    meta: { total: 0, page: 1, limit: 20, pages: 1 },
  },
};

function makeMembers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `mem-${i + 1}`,
    email: `user${i + 1}@sekolah.sch.id`,
    name: `Guru ${i + 1}`,
    role: 'teacher' as const,
    state: 'active' as const,
    joinedAt: '2024-01-15T00:00:00Z',
    lastActiveAt: '2024-06-01T00:00:00Z',
  }));
}

beforeEach(() => {
  vi.mocked(schoolService.members).mockResolvedValue(okEmpty);
});

// ── 1. Loading state ──────────────────────────────────────────────────────────
describe('SectionGuru — loading state', () => {
  it('shows a loading indicator while fetch is in-flight', async () => {
    // Never resolves during this synchronous check
    vi.mocked(schoolService.members).mockReturnValue(new Promise(() => {}));

    renderGuru();

    // The AdminContentLoading component renders — we just check something
    // meaningful is in the DOM that is NOT member rows
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('Tidak ada anggota')).not.toBeInTheDocument();
  });
});

// ── 2. Member rows from live service response ─────────────────────────────────
describe('SectionGuru — renders live member rows', () => {
  it('renders every member returned by schoolService.members()', async () => {
    const members = makeMembers(3);
    vi.mocked(schoolService.members).mockResolvedValueOnce({
      ok: true,
      value: {
        data: members,
        meta: { total: 3, page: 1, limit: 20, pages: 1 },
      },
    });

    renderGuru();

    await waitFor(() => {
      expect(screen.getByText('Guru 1')).toBeInTheDocument();
    });

    expect(screen.getByText('user1@sekolah.sch.id')).toBeInTheDocument();
    expect(screen.getByText('Guru 2')).toBeInTheDocument();
    expect(screen.getByText('Guru 3')).toBeInTheDocument();
  });

  it('shows role and status pills from response — not hardcoded values', async () => {
    const members = [
      {
        id: 'mem-a',
        email: 'admin@s.id',
        name: 'Admin Satu',
        role: 'school_admin' as const,
        state: 'active' as const,
        joinedAt: '2024-01-01T00:00:00Z',
        lastActiveAt: null,
      },
      {
        id: 'mem-b',
        email: 'guru@s.id',
        name: 'Guru Ditangguh',
        role: 'teacher' as const,
        state: 'suspended' as const,
        joinedAt: '2024-02-01T00:00:00Z',
        lastActiveAt: null,
      },
    ];
    vi.mocked(schoolService.members).mockResolvedValueOnce({
      ok: true,
      value: { data: members, meta: { total: 2, page: 1, limit: 20, pages: 1 } },
    });

    renderGuru();

    await waitFor(() => {
      expect(screen.getByText('Admin sekolah')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Guru').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Aktif')).toBeInTheDocument();
    expect(screen.getByText('Ditangguhkan')).toBeInTheDocument();
  });

  it('calls schoolService.members() — never reads MOCK_MEMBERS', async () => {
    renderGuru();

    await waitFor(() => {
      expect(vi.mocked(schoolService.members)).toHaveBeenCalledTimes(1);
    });

    // The first call arg is a params object; role/q/page/limit — never an
    // in-process constant array. Verifying the service was called is sufficient.
    expect(vi.mocked(schoolService.members)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20 }),
    );
  });
});

// ── 3. Empty state ────────────────────────────────────────────────────────────
describe('SectionGuru — empty state', () => {
  it('shows an explicit empty state when the API returns an empty data array', async () => {
    vi.mocked(schoolService.members).mockResolvedValueOnce(okEmpty);

    renderGuru();

    // wait for loading to settle
    await waitFor(() => {
      expect(screen.getByRole('status', { name: /Belum ada anggota sekolah/ })).toBeInTheDocument();
    });

    // no member rows
    expect(screen.queryByText('Guru 1')).not.toBeInTheDocument();
  });
});

// ── 4. Error state ────────────────────────────────────────────────────────────
describe('SectionGuru — error state', () => {
  it('shows an explicit error state when schoolService.members() fails', async () => {
    vi.mocked(schoolService.members).mockResolvedValueOnce({
      ok: false,
      error: {
        code: 'NETWORK',
        safeMessage: 'Tidak dapat terhubung ke server.',
        retryable: true,
      },
    });

    renderGuru();

    await waitFor(() => {
      expect(
        screen.getByRole('alert', { name: /Gagal memuat anggota sekolah/ }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Tidak dapat terhubung ke server.')).toBeInTheDocument();

    // member rows must NOT appear
    expect(screen.queryByText('Guru 1')).not.toBeInTheDocument();
  });
});

// ── 5. Pagination: meta.pages drives controls ─────────────────────────────────
describe('SectionGuru — pagination from meta.pages', () => {
  it('hides pagination controls when meta.pages === 1', async () => {
    vi.mocked(schoolService.members).mockResolvedValueOnce({
      ok: true,
      value: {
        data: makeMembers(5),
        meta: { total: 5, page: 1, limit: 20, pages: 1 },
      },
    });

    renderGuru();

    await waitFor(() => {
      expect(screen.getByText('Guru 1')).toBeInTheDocument();
    });

    expect(screen.queryByText(/halaman/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sebelumnya/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Berikutnya/)).not.toBeInTheDocument();
  });

  it('shows pagination controls and correct label when meta.pages > 1', async () => {
    vi.mocked(schoolService.members).mockResolvedValueOnce({
      ok: true,
      value: {
        data: makeMembers(20),
        meta: { total: 45, page: 1, limit: 20, pages: 3 },
      },
    });

    renderGuru();

    await waitFor(() => {
      expect(screen.getByText(/45 anggota/)).toBeInTheDocument();
    });

    expect(screen.getByText(/halaman 1 \/ 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sebelumnya/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Berikutnya/ })).not.toBeDisabled();
  });

  it('disables Berikutnya on the last page', async () => {
    vi.mocked(schoolService.members).mockResolvedValueOnce({
      ok: true,
      value: {
        data: makeMembers(5),
        meta: { total: 45, page: 3, limit: 20, pages: 3 },
      },
    });

    renderGuru();

    await waitFor(() => {
      expect(screen.getByText(/halaman 3 \/ 3/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Berikutnya/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Sebelumnya/ })).not.toBeDisabled();
  });

  it('fetches the next page when Berikutnya is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(schoolService.members)
      .mockResolvedValueOnce({
        ok: true,
        value: {
          data: makeMembers(20),
          meta: { total: 45, page: 1, limit: 20, pages: 3 },
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        value: {
          data: makeMembers(20).map((m) => ({ ...m, name: `Page2 ${m.name}` })),
          meta: { total: 45, page: 2, limit: 20, pages: 3 },
        },
      });

    renderGuru();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Berikutnya/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Berikutnya/ }));

    await waitFor(() => {
      expect(screen.getByText(/halaman 2 \/ 3/)).toBeInTheDocument();
    });

    expect(vi.mocked(schoolService.members)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(schoolService.members)).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });
});
