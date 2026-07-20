import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SchoolPlaceholderPage from '../(school)/school/[[...slug]]/page';

describe('F6-13 school admin shell placeholders — /school/*', () => {
  it('renders index with section nav when no slug', () => {
    render(<SchoolPlaceholderPage params={{}} />);

    expect(screen.getByRole('heading', { level: 1, name: /admin sekolah/i })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: /navigasi school admin/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^guru$/i })).toHaveAttribute('href', '/school/guru');
    expect(screen.getByRole('link', { name: /penggunaan/i })).toHaveAttribute('href', '/school/penggunaan');
  });

  it('renders guru section placeholder', () => {
    render(<SchoolPlaceholderPage params={{ slug: ['guru'] }} />);
    expect(screen.getByRole('heading', { level: 1, name: /^guru$/i })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders guru/undang section placeholder', () => {
    render(<SchoolPlaceholderPage params={{ slug: ['guru', 'undang'] }} />);
    expect(screen.getByRole('heading', { level: 1, name: /undang guru/i })).toBeInTheDocument();
  });

  it('renders audit section placeholder', () => {
    render(<SchoolPlaceholderPage params={{ slug: ['audit'] }} />);
    expect(screen.getByRole('heading', { level: 1, name: /audit/i })).toBeInTheDocument();
  });

  it('copy distinguishes school-admin from teacher workspace', () => {
    render(<SchoolPlaceholderPage params={{}} />);
    const content = document.body.textContent ?? '';
    // Must not say it's for teacher personal workspace
    expect(content).not.toMatch(/workspace (guru|pribadi) anda/i);
    // Must reference school-admin / aggregate context
    expect(content).toMatch(/admin sekolah|data agregat sekolah/i);
  });
});
