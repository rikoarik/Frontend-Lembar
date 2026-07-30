import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import { AdminPanelProvider } from '@/src/features/admin/adminPanelState';
import { schoolService } from '@/src/services/school/schoolService';

vi.mock('@/src/services/school/schoolService', () => ({
  schoolService: {
    dashboard: vi.fn(),
  },
}));

function renderRingkasan() {
  return render(
    <AdminPanelProvider panelId="school">
      <SchoolAdminView />
    </AdminPanelProvider>,
  );
}

describe('school admin live KPI cards', () => {
  it('renders Ringkasan cards from the live dashboard response without static fallback values', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValueOnce({
      ok: true,
      value: {
        workspace: {
          id: 'ws-live',
          name: '',
          level: '',
          tenantId: 'tenant-live',
        },
        members: [],
        memberCount: 0,
        usage: {
          generationsUsedThisMonth: 0,
          monthlyLimit: null,
          plan: 'free',
        },
      },
    });

    renderRingkasan();

    await waitFor(() => {
      expect(screen.getByText('Anggota aktif')).toBeInTheDocument();
    });

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('dari 0 total')).toBeInTheDocument();
    expect(screen.getByText('0 / ∞')).toBeInTheDocument();
    expect(screen.getByText('free')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(1);
    expect(screen.queryByText('SD / SMP / SMA')).not.toBeInTheDocument();
    expect(screen.queryByText('Paket Sekolah Basic')).not.toBeInTheDocument();
  });

  it('renders an explicit Ringkasan empty state when the dashboard request fails', async () => {
    vi.mocked(schoolService.dashboard).mockResolvedValueOnce({
      ok: false,
      error: {
        code: 'NETWORK',
        safeMessage: 'Tidak dapat terhubung.',
        retryable: true,
      },
    });

    renderRingkasan();

    expect(await screen.findByText('Data ringkasan tidak tersedia')).toBeInTheDocument();
    expect(screen.queryByText('Anggota aktif')).not.toBeInTheDocument();
  });
});
