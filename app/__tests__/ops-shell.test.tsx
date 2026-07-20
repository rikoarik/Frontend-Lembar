import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import OpsPlaceholderPage from '../(ops)/ops/[[...slug]]/page';

describe('F6-12 ops shell placeholders — /ops/*', () => {
  it('renders index with section nav when no slug', () => {
    render(<OpsPlaceholderPage params={{}} />);

    expect(screen.getByRole('heading', { level: 1, name: /operasional/i })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: /navigasi ops/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /akun/i })).toHaveAttribute('href', '/ops/accounts');
    expect(screen.getByRole('link', { name: /sekolah/i })).toHaveAttribute('href', '/ops/schools');
  });

  it('renders accounts section placeholder', () => {
    render(<OpsPlaceholderPage params={{ slug: ['accounts'] }} />);
    expect(screen.getByRole('heading', { level: 1, name: /akun/i })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders billing section placeholder', () => {
    render(<OpsPlaceholderPage params={{ slug: ['billing'] }} />);
    expect(screen.getByRole('heading', { level: 1, name: /billing/i })).toBeInTheDocument();
  });

  it('renders flags section placeholder', () => {
    render(<OpsPlaceholderPage params={{ slug: ['flags'] }} />);
    expect(screen.getByRole('heading', { level: 1, name: /feature flags/i })).toBeInTheDocument();
  });

  it('does not leak teacher or workspace content', () => {
    render(<OpsPlaceholderPage params={{}} />);
    const content = document.body.textContent ?? '';
    expect(content).not.toMatch(/workspace guru|bank soal|lembar kerja guru/i);
  });
});
