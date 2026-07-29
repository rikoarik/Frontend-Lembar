import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ShellError,
  ShellForbidden,
  ShellLoading,
  ShellNotFound,
} from '@/app/components/app/ShellStates';
import AppError from '../error';

describe('Shell states', () => {
  it('renders loading skeleton with busy state', () => {
    const { container } = render(<ShellLoading />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders error state with request id', () => {
    render(<ShellError requestId="req-123" />);
    expect(screen.getByText('Workspace belum bisa dimuat')).toBeInTheDocument();
    expect(screen.getByText(/req-123/)).toBeInTheDocument();
  });

  it('uses the real Next error digest instead of a demo request id', () => {
    render(<AppError error={Object.assign(new Error('failed'), { digest: 'req-live-123' })} />);
    expect(screen.getByText(/req-live-123/)).toBeInTheDocument();
    expect(screen.queryByText(/demo-shell-request/)).not.toBeInTheDocument();
  });

  it('renders forbidden state guidance', () => {
    render(<ShellForbidden />);
    expect(screen.getByText('Akses belum tersedia')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hubungi bantuan' })).toBeInTheDocument();
  });

  it('renders not-found fallback', () => {
    render(<ShellNotFound />);
    expect(screen.getByText('Halaman tidak ditemukan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke dashboard' })).toBeInTheDocument();
  });
});
