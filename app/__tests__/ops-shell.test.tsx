import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpsConsoleView } from '@/src/features/ops/OpsConsoleView';

describe('ops superadmin management panel', () => {
  it('renders ops dashboard with jobs table', () => {
    render(<OpsConsoleView section="" />);
    expect(screen.getByRole('heading', { level: 1, name: /ringkasan/i })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: /navigasi panel/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/job_8f2a/i)).toBeInTheDocument();
  });

  it('renders accounts management table and supports search', async () => {
    const user = userEvent.setup();
    render(<OpsConsoleView section="accounts" />);
    expect(screen.getByRole('heading', { level: 1, name: /akun/i })).toBeInTheDocument();
    const search = screen.getByPlaceholderText(/cari akun, email, role, sekolah/i);
    await user.type(search, 'ops');
    expect(screen.getByText(/Ops Superadmin/i)).toBeInTheDocument();
    expect(screen.queryByText(/Demo Guru/i)).not.toBeInTheDocument();
  });

  it('renders billing section table', () => {
    render(<OpsConsoleView section="billing" />);
    expect(screen.getByRole('heading', { level: 1, name: /billing/i })).toBeInTheDocument();
    expect(screen.getByText(/SMP Harapan/i)).toBeInTheDocument();
  });

  it('does not leak teacher question content', () => {
    render(<OpsConsoleView section="" />);
    const content = document.body.textContent ?? '';
    expect(content).not.toMatch(/workspace guru|bank soal pribadi|lembar kerja guru/i);
  });
});
