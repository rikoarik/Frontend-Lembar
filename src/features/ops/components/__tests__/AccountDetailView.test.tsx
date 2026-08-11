import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AccountDetailView } from '../AccountDetailView';
import { adminService } from '@/src/services/admin/adminService';

vi.mock('@/src/services/admin/adminService', () => ({
  adminService: {
    accountDetail: vi.fn(),
    setEntitlement: vi.fn(),
  },
}));

const accountDetailMock = vi.mocked(adminService.accountDetail);
const setEntitlementMock = vi.mocked(adminService.setEntitlement);

const detail = {
  id: 'account-1',
  name: 'Guru Uji',
  email: 'guru@uji.id',
  role: 'school_admin' as const,
  status: 'aktif' as const,
  workspaceId: 'workspace-1',
  billing: { state: 'active', plan: 'pro', seats: 4 },
  workspacePlan: { planKey: 'pro', tokenUsedThisMonth: 12500, tokenMonthlyLimit: null },
  stats: { quotaUsed: 7, jobsTotal: 12 },
};

function renderDetail() {
  return render(
    <AccountDetailView
      accountId="account-1"
      onBack={vi.fn()}
      onUpdated={vi.fn()}
      setToast={vi.fn()}
    />,
  );
}

describe('AccountDetailView entitlement control', () => {
  it('confirms and applies the selected workspace plan without changing usage', async () => {
    accountDetailMock.mockResolvedValue({ ok: true, value: detail });
    setEntitlementMock.mockResolvedValue({
      ok: true,
      value: { workspaceId: 'workspace-1', previousPlan: 'pro', newPlan: 'free' },
    });
    const user = userEvent.setup();

    renderDetail();

    expect(await screen.findByText('Entitlement Workspace')).toBeInTheDocument();
    expect(screen.getByText('Paket saat ini: Pro')).toBeInTheDocument();
    expect(
      screen.getByText('Token terpakai bulan ini: 12.500 / Tidak terbatas'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Kuota terpakai: 7')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Paket baru'), 'free');
    await user.click(screen.getByRole('button', { name: 'Ubah entitlement' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Free');
    await user.click(screen.getByRole('button', { name: 'Ya, ubah ke Free' }));

    await waitFor(() => {
      expect(setEntitlementMock).toHaveBeenCalledWith('workspace-1', { plan: 'free' });
    });
    expect(await screen.findByText('Entitlement berhasil diubah ke Free.')).toBeInTheDocument();
    expect(screen.getByText('Paket saat ini: Free')).toBeInTheDocument();
  });
});
