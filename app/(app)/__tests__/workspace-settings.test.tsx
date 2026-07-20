import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceSettingsPage from '../app/pengaturan/workspace/page';

describe('F2-07 workspace settings — /app/pengaturan/workspace', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders membership list with role labels and active indicator', () => {
    render(<WorkspaceSettingsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /workspace/i }),
    ).toBeInTheDocument();

    const list = screen.getByRole('list', { name: /daftar workspace/i });
    expect(list).toBeInTheDocument();

    // active workspace shows "Aktif" badge
    expect(screen.getByLabelText(/workspace aktif/i)).toBeInTheDocument();

    // role labels rendered
    expect(screen.getByText('Pemilik')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Anggota')).toBeInTheDocument();
  });

  it('shows switch confirmation when Pilih is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkspaceSettingsPage />);

    const switchButtons = screen.getAllByRole('button', { name: /pilih/i });
    await user.click(switchButtons[0]);

    expect(screen.getByText(/beralih ke workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ya, beralih/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
  });

  it('shows success status after confirming switch (mock)', async () => {
    const user = userEvent.setup();
    render(<WorkspaceSettingsPage />);

    const switchButtons = screen.getAllByRole('button', { name: /pilih/i });
    await user.click(switchButtons[0]);
    await user.click(screen.getByRole('button', { name: /ya, beralih/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/beralih ke workspace/i);
    });
  });

  it('shows leave confirmation when Keluar is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkspaceSettingsPage />);

    const leaveButtons = screen.getAllByRole('button', { name: /^keluar$/i });
    await user.click(leaveButtons[0]);

    expect(screen.getByText(/yakin ingin keluar dari workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ya, keluar/i })).toBeInTheDocument();
  });

  it('shows success status after confirming leave (mock)', async () => {
    const user = userEvent.setup();
    render(<WorkspaceSettingsPage />);

    const leaveButtons = screen.getAllByRole('button', { name: /^keluar$/i });
    await user.click(leaveButtons[0]);
    await user.click(screen.getByRole('button', { name: /ya, keluar/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/telah keluar dari workspace/i);
    });
  });

  it('does not show leave button for personal workspace', () => {
    render(<WorkspaceSettingsPage />);

    // "Workspace Pribadi" is personal + owner — no Keluar button.
    // "SD Negeri 01 Maju" is non-personal admin — Keluar shown.
    // "Tim Guru Matematika" is non-personal member — Keluar shown.
    // Personal workspace owner is excluded; both non-personal non-owner roles get Keluar.
    const leaveButtons = screen.queryAllByRole('button', { name: /^keluar$/i });
    expect(leaveButtons).toHaveLength(2);
  });
});
