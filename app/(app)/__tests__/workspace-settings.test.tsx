import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceSettingsPage from '../app/pengaturan/workspace/page';

const MOCK_WORKSPACES = [
  { id: 'ws-1', name: 'Workspace Pribadi', type: 'personal', role: 'owner', permissions: [] },
  {
    id: 'ws-2',
    name: 'SD Negeri 01 Maju',
    type: 'school',
    role: 'school_admin',
    permissions: [],
  },
  {
    id: 'ws-3',
    name: 'Tim Guru Matematika',
    type: 'school',
    role: 'teacher',
    permissions: [],
  },
];

function mockFetch() {
  const fetchSpy = vi.fn().mockImplementation((url: string) => {
    if (url === '/v1/me') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { workspaces: MOCK_WORKSPACES } }),
      });
    }
    if (url === '/v1/auth/workspace/switch') {
      // Return failure so the page shows error status instead of reloading
      return Promise.resolve({ ok: false, status: 500 });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

describe('F2-07 workspace settings — /app/pengaturan/workspace', () => {
  beforeEach(() => {
    mockFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders membership list with role labels and active indicator', async () => {
    render(<WorkspaceSettingsPage />);

    await waitFor(() => {
      expect(screen.queryByText(/memuat…/i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { level: 1, name: /workspace/i })).toBeInTheDocument();

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

    await waitFor(() => {
      expect(screen.queryByText(/memuat…/i)).not.toBeInTheDocument();
    });

    const switchButtons = screen.getAllByRole('button', { name: /pilih/i });
    await user.click(switchButtons[0]);

    expect(screen.getByText(/beralih ke workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ya, beralih/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
  });

  it('shows error status when switch fails', async () => {
    const user = userEvent.setup();
    render(<WorkspaceSettingsPage />);

    await waitFor(() => {
      expect(screen.queryByText(/memuat…/i)).not.toBeInTheDocument();
    });

    const switchButtons = screen.getAllByRole('button', { name: /pilih/i });
    await user.click(switchButtons[0]);
    await user.click(screen.getByRole('button', { name: /ya, beralih/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/beralih ke workspace/i);
    });
  });

  it('does not offer a fake leave action without a backend contract', async () => {
    render(<WorkspaceSettingsPage />);

    await waitFor(() => {
      expect(screen.queryByText(/memuat…/i)).not.toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /^keluar$/i })).toBeNull();
    expect(screen.getByText(/dikelola oleh admin sekolah/i)).toBeInTheDocument();
  });
});
