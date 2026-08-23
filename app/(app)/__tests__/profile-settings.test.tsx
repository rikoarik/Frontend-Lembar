import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileSettingsPage from '../app/pengaturan/profil/page';

describe('profile settings — /app/pengaturan/profil', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            account: {
              id: 'account-1',
              displayName: 'All Roles',
              email: 'allroles@test.com',
            },
          },
        }),
      }),
    );
  });

  it('renders account identity returned by /v1/me', async () => {
    render(<ProfileSettingsPage />);

    expect(await screen.findAllByText('All Roles')).toHaveLength(2);
    expect(screen.getAllByText('allroles@test.com')).toHaveLength(2);
  });

  it('does not offer profile mutations without a backend contract', async () => {
    render(<ProfileSettingsPage />);
    await screen.findAllByText('All Roles');

    expect(screen.queryByRole('button', { name: /simpan|ubah email|keluarkan semua/i })).toBeNull();
    expect(screen.getByRole('link', { name: /atur ulang kata sandi/i })).toHaveAttribute(
      'href',
      '/lupa-sandi',
    );
    expect(screen.getByText(/tidak dapat diubah dari frontend/i)).toBeInTheDocument();
  });

  it('shows an actionable error when the profile request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    render(<ProfileSettingsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/gagal memuat profil/i);
  });
});
