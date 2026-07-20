import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppDashboardPage from '../(app)/app/page';

const mockGET = vi.fn();

vi.mock('@/src/lib/api/client', () => ({
  apiClient: { GET: (...args: unknown[]) => mockGET(...args) },
}));

const POPULATED = {
  data: {
    workspace: { id: 'ws-1', type: 'personal', name: 'Workspace Demo', role: 'teacher', permissions: [] },
    metrics: {
      assessments: { total: 15, draft: 8, inReview: 3, final: 4 },
      sources: { total: 5, ready: 4, processing: 1, failed: 0 },
      jobs: { total: 2, active: 1, failed: 0 },
    },
    emptyState: { isEmpty: false, message: '' },
  },
};

const EMPTY = {
  data: {
    workspace: { id: 'ws-1', type: 'personal', name: 'Workspace Demo', role: 'teacher', permissions: [] },
    metrics: {
      assessments: { total: 0, draft: 0, inReview: 0, final: 0 },
      sources: { total: 0, ready: 0, processing: 0, failed: 0 },
      jobs: { total: 0, active: 0, failed: 0 },
    },
    emptyState: { isEmpty: true, message: 'Belum ada lembar. Mulai dengan membuat lembar pertama Anda.' },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: populated success
  mockGET.mockResolvedValue({ data: POPULATED, error: undefined });
});

describe('F2-04 teacher dashboard — /app', () => {
  it('shows loading state initially', () => {
    // Never resolves so we can catch the loading state
    mockGET.mockReturnValue(new Promise(() => {}));
    render(<AppDashboardPage />);
    expect(screen.getByLabelText(/memuat dashboard/i)).toBeInTheDocument();
  });

  it('renders populated state with workspace name and metrics', async () => {
    render(<AppDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Workspace Demo')).toBeInTheDocument();
    });

    expect(screen.getByTestId('metric-assessments-total')).toHaveTextContent('15');
    expect(screen.getByTestId('metric-assessments-final')).toHaveTextContent('4');
    expect(screen.getByTestId('metric-assessments-review')).toHaveTextContent('3');
  });

  it('renders source metrics when sources exist', async () => {
    render(<AppDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-sources-ready')).toHaveTextContent('4');
    });
  });

  it('renders empty state with CTA when workspace is empty', async () => {
    mockGET.mockResolvedValue({ data: EMPTY, error: undefined });
    render(<AppDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/belum ada lembar/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /buat lembar/i })).toBeInTheDocument();
  });

  it('renders error state on API failure with retry button', async () => {
    mockGET.mockResolvedValue({ data: undefined, error: { code: 'ERR', message: 'fail' } });
    render(<AppDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /coba lagi/i })).toBeInTheDocument();
  });

  it('retry button re-triggers load', async () => {
    let callCount = 0;
    mockGET.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ data: undefined, error: { code: 'ERR', message: 'fail' } });
      }
      return Promise.resolve({ data: POPULATED, error: undefined });
    });

    const user = userEvent.setup();
    render(<AppDashboardPage />);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /coba lagi/i }));

    await waitFor(() => expect(screen.getByText('Workspace Demo')).toBeInTheDocument());
  });
});
