import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';

describe('school admin management panel', () => {
  it('renders dashboard management chrome and teacher table', () => {
    render(<SchoolAdminView section="" />);
    expect(screen.getByRole('heading', { level: 1, name: /ringkasan/i })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: /navigasi panel/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Siti Aminah/i)).toBeInTheDocument();
    expect(screen.getByText(/panel admin sekolah/i)).toBeInTheDocument();
  });

  it('filters guru table by search', async () => {
    const user = userEvent.setup();
    render(<SchoolAdminView section="guru" />);
    const search = screen.getByPlaceholderText(/cari nama, email, atau peran/i);
    await user.clear(search);
    await user.type(search, 'Rina');
    expect(screen.getByText(/Rina Kartika/i)).toBeInTheDocument();
    expect(screen.queryByText(/Budi Santoso/i)).not.toBeInTheDocument();
  });

  it('renders invite form', () => {
    render(<SchoolAdminView section="guru/undang" />);
    expect(screen.getByRole('heading', { level: 1, name: /undang/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email guru/i)).toBeInTheDocument();
  });
});
