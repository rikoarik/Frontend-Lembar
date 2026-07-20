import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ShareViewer from '../(share)/bagikan/[token]/ShareViewer';

describe('F1-11 share viewer — /bagikan/[token]', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /ujian matematika/i,
      );
    });

    expect(screen.getByText(/lembar soal/i)).toBeInTheDocument();
    expect(screen.getByText(/kunci jawaban/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /lihat/i })).toHaveLength(2);
  });

  it('shows revoked state without leaking assessment metadata', async () => {
    render(<ShareViewer token="revoked-test" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /tautan tidak tersedia/i,
      );
    });

    // Must NOT show the assessment title
    expect(screen.queryByText(/ujian matematika/i)).not.toBeInTheDocument();
    // Must NOT show workspace info
    expect(screen.queryByText(/workspace/i)).not.toBeInTheDocument();
  });

  it('shows expired state without leaking assessment metadata', async () => {
    render(<ShareViewer token="expired-test" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        /tautan kedaluwarsa/i,
      );
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
