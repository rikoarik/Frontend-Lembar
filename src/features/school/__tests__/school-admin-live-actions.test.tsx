/**
 * TDD — school-admin-live-actions
 *
 * Covers:
 *  1. "Undang guru" form calls schoolService.inviteMember() and shows
 *     the real server response in the toast (success + error branch).
 *  2. "Hapus anggota" confirm flow calls schoolService.removeMember()
 *     and shows the real server response in the toast (success + error branch).
 *
 * Out of scope: billing, LMS, output, pagination.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AdminPanelProvider, useAdminPanel } from '@/src/features/admin/adminPanelState';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import { schoolService } from '@/src/services/school/schoolService';

// ── mock the entire service ────────────────────────────────────────────────────
vi.mock('@/src/services/school/schoolService', () => ({
  schoolService: {
    dashboard: vi.fn(),
    members: vi.fn(),
    memberSuspend: vi.fn(),
    memberUnsuspend: vi.fn(),
    inviteMember: vi.fn(),
    removeMember: vi.fn(),
    usage: vi.fn(),
    settings: vi.fn(),
    library: vi.fn(),
    audit: vi.fn(),
    invitations: vi.fn(),
    cancelInvitation: vi.fn(),
    notifications: vi.fn(),
    stats: vi.fn(),
    updateMemberRole: vi.fn(),
    updateSettings: vi.fn(),
    libraryDetail: vi.fn(),
  },
}));

// ── minimal stubs shared across tests ─────────────────────────────────────────
const okVoid = { ok: true as const, value: undefined };
const okInvite = {
  ok: true as const,
  value: { token: 't1', email: 'server-budi@sdn1.sch.id', expiresAt: '2030-01-01' },
};

const MEMBER = {
  id: 'mem-1',
  name: 'Budi Santoso',
  email: 'budi@sdn1.sch.id',
  role: 'teacher' as const,
  state: 'active' as const,
  joinedAt: '2026-01-01T00:00:00Z',
  lastActiveAt: null,
};

const memberPage = {
  ok: true as const,
  value: {
    data: [MEMBER],
    meta: { total: 1, page: 1, limit: 20, pages: 1 },
  },
};

const emptyPage = {
  ok: true as const,
  value: { data: [], meta: { total: 0, page: 1, limit: 20, pages: 1 } },
};

const dashboardOk = {
  ok: true as const,
  value: {
    workspace: { id: 'ws-1', name: 'SDN 1', level: 'SD', tenantId: 'ten-1' },
    members: [],
    memberCount: 0,
    usage: { generationsUsedThisMonth: 0, monthlyLimit: null, plan: 'free' as const },
  },
};

// ── helpers ───────────────────────────────────────────────────────────────────

/** Render SchoolAdminView on one exact scoped section. */
function renderView(section: 'guru' | 'undang') {
  return render(
    <AdminPanelProvider panelId="school">
      <ToastProbe />
      <SchoolAdminView section={section} />
    </AdminPanelProvider>,
  );
}

function ToastProbe() {
  const { toast } = useAdminPanel();
  return toast ? <div role="status">{toast}</div> : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Undang guru — schoolService.inviteMember
// ═══════════════════════════════════════════════════════════════════════════════

describe('SectionUndang — inviteMember live action', () => {
  it('[RED→GREEN] calls schoolService.inviteMember with email + role on submit', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.inviteMember).mockResolvedValue(okInvite);

    const user = userEvent.setup();
    renderView('undang');

    const emailInput = await screen.findByLabelText(/email/i);
    await user.type(emailInput, 'budi@sdn1.sch.id');
    await user.click(screen.getByRole('button', { name: /kirim undangan/i }));

    await waitFor(() => {
      expect(vi.mocked(schoolService.inviteMember)).toHaveBeenCalledWith({
        email: 'budi@sdn1.sch.id',
        role: 'teacher',
      });
    });
  });

  it('[RED→GREEN] shows success toast from real server response after invite', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.inviteMember).mockResolvedValue(okInvite);

    const user = userEvent.setup();
    renderView('undang');

    const emailInput = await screen.findByLabelText(/email/i);
    await user.type(emailInput, 'budi@sdn1.sch.id');
    await user.click(screen.getByRole('button', { name: /kirim undangan/i }));

    // Toast must include the email returned by the service — not the submitted/static value.
    await waitFor(() =>
      expect(screen.getByText(/undangan dikirim ke server-budi@sdn1\.sch\.id/i)).toBeInTheDocument(),
    );

    // Email field is cleared after success
    expect((emailInput as HTMLInputElement).value).toBe('');
  });

  it('[RED→GREEN] shows error toast from res.error.safeMessage when invite fails', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.inviteMember).mockResolvedValue({
      ok: false,
      error: {
        code: 'QUOTA_EXCEEDED',
        safeMessage: 'Kuota undangan habis.',
        retryable: false,
      },
    });

    const user = userEvent.setup();
    renderView('undang');

    const emailInput = await screen.findByLabelText(/email/i);
    await user.type(emailInput, 'budi@sdn1.sch.id');
    await user.click(screen.getByRole('button', { name: /kirim undangan/i }));

    // Toast must carry the real safeMessage from the API — not a static string
    await waitFor(() =>
      expect(screen.getByText(/kuota undangan habis/i)).toBeInTheDocument(),
    );

    // Email field is NOT cleared on failure
    expect((emailInput as HTMLInputElement).value).toBe('budi@sdn1.sch.id');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Hapus anggota — schoolService.removeMember
// ═══════════════════════════════════════════════════════════════════════════════

describe('SectionAnggota — removeMember live action', () => {
  it('[RED→GREEN] opens confirmation modal when "Hapus" button is clicked', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.members).mockResolvedValue(memberPage);

    const user = userEvent.setup();
    renderView('guru');

    const hapusBtn = await screen.findByRole('button', { name: /hapus/i });
    await user.click(hapusBtn);

    // Confirmation modal must be visible
    expect(await screen.findByText(/hapus anggota sekolah/i)).toBeInTheDocument();
  });

  it('[RED→GREEN] calls schoolService.removeMember with the member id on confirm', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.members).mockResolvedValue(memberPage);
    vi.mocked(schoolService.removeMember).mockResolvedValue(okVoid);

    const user = userEvent.setup();
    renderView('guru');

    await user.click(await screen.findByRole('button', { name: /hapus/i }));
    await screen.findByText(/hapus anggota sekolah/i);

    // Click the confirm button inside the modal
    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: /ya, hapus/i }));

    await waitFor(() => {
      expect(vi.mocked(schoolService.removeMember)).toHaveBeenCalledWith('mem-1');
    });
  });

  it('[RED→GREEN] shows success toast with member name from real response after remove', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.members)
      .mockResolvedValueOnce(memberPage) // initial load
      .mockResolvedValue(emptyPage);     // after remove
    vi.mocked(schoolService.removeMember).mockResolvedValue(okVoid);

    const user = userEvent.setup();
    renderView('guru');

    await user.click(await screen.findByRole('button', { name: /hapus/i }));
    await screen.findByText(/hapus anggota sekolah/i);

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: /ya, hapus/i }));

    // Toast uses the real member name — not a static placeholder
    await waitFor(() =>
      expect(screen.getByText(/budi santoso dihapus/i)).toBeInTheDocument(),
    );
  });

  it('[RED→GREEN] shows error toast from res.error.safeMessage when remove fails', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.members).mockResolvedValue(memberPage);
    vi.mocked(schoolService.removeMember).mockResolvedValue({
      ok: false,
      error: {
        code: 'FORBIDDEN',
        safeMessage: 'Tidak dapat menghapus admin terakhir.',
        retryable: false,
      },
    });

    const user = userEvent.setup();
    renderView('guru');

    await user.click(await screen.findByRole('button', { name: /hapus/i }));
    await screen.findByText(/hapus anggota sekolah/i);

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: /ya, hapus/i }));

    // Toast must carry the real safeMessage from the API
    await waitFor(() =>
      expect(
        screen.getByText(/tidak dapat menghapus admin terakhir/i),
      ).toBeInTheDocument(),
    );
  });

  it('[RED→GREEN] does NOT call removeMember when confirmation is cancelled', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValue(dashboardOk);
    vi.mocked(schoolService.members).mockResolvedValue(memberPage);

    const user = userEvent.setup();
    renderView('guru');

    await user.click(await screen.findByRole('button', { name: /hapus/i }));
    await screen.findByText(/hapus anggota sekolah/i);

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: /batal/i }));

    expect(vi.mocked(schoolService.removeMember)).not.toHaveBeenCalled();
  });
});
