import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OpsConsoleView } from '@/src/features/ops/OpsConsoleView';

describe('F6 ops mock surfaces — /ops/*', () => {
  it('renders index with section nav when no section', () => {
    render(<OpsConsoleView section="" />);

    expect(
      screen.getByRole('heading', { level: 1, name: /operasional platform/i }),
    ).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: /navigasi ops/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /akun/i })).toHaveAttribute('href', '/ops/accounts');
    expect(screen.getByRole('link', { name: /^sekolah$/i })).toHaveAttribute(
      'href',
      '/ops/schools',
    );
  });

  it('renders accounts section', () => {
    render(<OpsConsoleView section="accounts" />);
    expect(screen.getByRole('heading', { level: 1, name: /^akun$/i })).toBeInTheDocument();
  });

  it('renders billing section', () => {
    render(<OpsConsoleView section="billing" />);
    expect(screen.getByRole('heading', { level: 1, name: /billing/i })).toBeInTheDocument();
  });

  it('renders flags section', () => {
    render(<OpsConsoleView section="flags" />);
    expect(screen.getByRole('heading', { level: 1, name: /feature flags/i })).toBeInTheDocument();
  });

  it('does not leak teacher or workspace content', () => {
    render(<OpsConsoleView section="" />);
    const content = document.body.textContent ?? '';
    expect(content).not.toMatch(/workspace guru|bank soal|lembar kerja guru/i);
  });
});
