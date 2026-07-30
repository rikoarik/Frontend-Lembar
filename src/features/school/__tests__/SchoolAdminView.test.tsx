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
    members: vi.fn(),
    memberSuspend: vi.fn(),
    memberUnsuspend: vi.fn(),
    removeMember: vi.fn(),
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
