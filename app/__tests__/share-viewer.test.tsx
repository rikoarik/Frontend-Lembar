import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ShareViewer from '../(share)/bagikan/[token]/ShareViewer';

describe('F1-11 share viewer — /bagikan/[token]', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('revoked-test')) return Promise.resolve(new Response(null, { status: 404 }));
        if (url.includes('expired-test')) {
          return Promise.resolve(
            new Response(JSON.stringify({ error: { code: 'SHARE_EXPIRED' } }), { status: 410 }),
          );
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                assessmentId: 'assessment-1',
                title: 'Ujian Matematika',
                expiresAt: '2099-01-01T00:00:00.000Z',
                questions: [
                  {
                    id: 'question-1',
                    blueprintSequence: 1,
                    questionType: 'multiple_choice',
                    difficulty: 'easy',
                    stem: '2 + 2 = ?',
                    options: [{ key: 'A', text: '4' }],
                    answer: 'A',
                    explanation: 'Penjumlahan dasar.',
                  },
                ],
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    render(<ShareViewer token="some-valid-token" />);
    expect(screen.getByText(/memuat/i)).toBeInTheDocument();
  });

  it('renders valid share package with sheet list', async () => {
    render(<ShareViewer token="valid-token" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/ujian matematika/i);
    });

    expect(screen.getByText('2 + 2 = ?')).toBeInTheDocument();
    expect(screen.getByText('A.')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows revoked state without leaking assessment metadata', async () => {
    render(<ShareViewer token="revoked-test" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/tautan tidak tersedia/i);
    });

    // Must NOT show the assessment title
    expect(screen.queryByText(/ujian matematika/i)).not.toBeInTheDocument();
    // Must NOT show workspace info
    expect(screen.queryByText(/workspace/i)).not.toBeInTheDocument();
  });

  it('shows expired state without leaking assessment metadata', async () => {
    render(<ShareViewer token="expired-test" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/tautan kedaluwarsa/i);
    });

    expect(screen.queryByText(/ujian matematika/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/workspace/i)).not.toBeInTheDocument();
  });

  it('does not leak workspace, account, or source info on valid state', async () => {
    render(<ShareViewer token="valid-token" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    const content = document.body.textContent ?? '';
    expect(content).not.toMatch(/workspace id|account|source|analitik|token/i);
  });
});
