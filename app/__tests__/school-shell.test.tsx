import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import { SchoolAdminShell } from '@/src/features/admin/AdminAppShell';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/school/guru',
  useRouter: () => ({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

function renderSchool(section: string) {
  return render(
    <SchoolAdminShell>
      <SchoolAdminView section={section} />
    </SchoolAdminShell>,
  );
}

describe('school admin management panel', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('keeps shell chrome and renders teacher table content', () => {
    renderSchool('');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: /navigasi panel/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Siti Aminah/i)).toBeInTheDocument();
    expect(screen.getByText(/panel admin sekolah/i)).toBeInTheDocument();
  });

  it('filters guru table by search and keeps state in panel store', async () => {
    const user = userEvent.setup();
    renderSchool('guru');
    const search = screen.getByPlaceholderText(/cari nama, email, atau peran/i);
    await user.clear(search);
    await user.type(search, 'Rina');
    expect(screen.getByText(/Rina Kartika/i)).toBeInTheDocument();
    expect(screen.queryByText(/Budi Santoso/i)).not.toBeInTheDocument();
  });

  it('renders invite form content', () => {
    renderSchool('guru/undang');
    expect(screen.getByLabelText(/email guru/i)).toBeInTheDocument();
  });
});
