import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSettingsPage from '../app/pengaturan/profil/page';

describe('F2-06 profile settings — /app/pengaturan/profil', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders display-name form, password-change entry, and log-out-everywhere CTA', async () => {
    render(<ProfileSettingsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /profil/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/nama tampilan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simpan nama/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /ubah kata sandi/i }),
    ).toHaveAttribute('href', '/lupa-sandi');
    expect(
      screen.getByRole('button', { name: /keluar dari semua perangkat/i }),
    ).toBeInTheDocument();
  });

  it('shows validation error when display name is empty on submit', async () => {
    const user = userEvent.setup();
    render(<ProfileSettingsPage />);

    const input = screen.getByLabelText(/nama tampilan/i);
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /simpan nama/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/nama tampilan wajib diisi/i);
  });

  it('shows saved status after successful display-name save (mock)', async () => {
    const user = userEvent.setup();
    render(<ProfileSettingsPage />);

    const input = screen.getByLabelText(/nama tampilan/i);
    await user.clear(input);
    await user.type(input, 'Guru Demo');
    await user.click(screen.getByRole('button', { name: /simpan nama/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/nama tampilan disimpan/i);
    });
  });

  it('shows confirmation then success for log-out-everywhere (mock)', async () => {
    const user = userEvent.setup();
    render(<ProfileSettingsPage />);

    await user.click(
      screen.getByRole('button', { name: /keluar dari semua perangkat/i }),
    );
    expect(
      screen.getByText(/semua sesi aktif akan diakhiri/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ya, keluarkan semua/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        /semua perangkat telah dikeluarkan/i,
      );
    });
  });
});
