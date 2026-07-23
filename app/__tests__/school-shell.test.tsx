import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';

describe('F6 school admin mock surfaces — /school/*', () => {
  it('renders index with section nav when no section', () => {
    render(<SchoolAdminView section="" />);

    expect(screen.getByRole('heading', { level: 1, name: /ringkasan/i })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: /navigasi school admin/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^guru$/i })).toHaveAttribute('href', '/school/guru');
    expect(screen.getByRole('link', { name: /penggunaan/i })).toHaveAttribute(
      'href',
      '/school/penggunaan',
    );
  });

  it('renders guru section', () => {
    render(<SchoolAdminView section="guru" />);
    expect(screen.getByRole('heading', { level: 1, name: /^guru$/i })).toBeInTheDocument();
  });

  it('renders guru/undang section', () => {
    render(<SchoolAdminView section="guru/undang" />);
    expect(screen.getByRole('heading', { level: 1, name: /undang guru/i })).toBeInTheDocument();
  });

  it('renders audit section', () => {
    render(<SchoolAdminView section="audit" />);
    expect(screen.getByRole('heading', { level: 1, name: /audit/i })).toBeInTheDocument();
  });

  it('copy distinguishes school-admin from teacher workspace', () => {
    render(<SchoolAdminView section="" />);
    const content = document.body.textContent ?? '';
    expect(content).not.toMatch(/workspace (guru|pribadi) anda/i);
    expect(content).toMatch(/admin sekolah|data agregat sekolah|agregat sekolah/i);
  });
});
