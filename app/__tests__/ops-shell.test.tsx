import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpsConsoleView } from '@/src/features/ops/OpsConsoleView';
import { OpsAdminShell } from '@/src/features/admin/AdminAppShell';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/ops/accounts',
  useRouter: () => ({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
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
  });

  it('keeps shell chrome and renders jobs table content', () => {
    renderOps('');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: /navigasi panel/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/job_8f2a/i)).toBeInTheDocument();
  });

  it('renders accounts management table and supports search state', async () => {
    const user = userEvent.setup();
    renderOps('accounts');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    const search = screen.getByPlaceholderText(/cari akun, email, role, sekolah/i);
    await user.type(search, 'ops');
    expect(screen.getByText(/Ops Superadmin/i)).toBeInTheDocument();
    expect(screen.queryByText(/Demo Guru/i)).not.toBeInTheDocument();
  });

  it('renders billing section table', () => {
    renderOps('billing');
    expect(screen.getByText(/SMP Harapan/i)).toBeInTheDocument();
  });

  it('does not leak teacher question content', () => {
    renderOps('');
    const content = document.body.textContent ?? '';
    expect(content).not.toMatch(/workspace guru|bank soal pribadi|lembar kerja guru/i);
  });
});
