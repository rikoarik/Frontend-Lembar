import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeftRail } from '../LeftRail';

vi.mock('next/navigation', () => ({ usePathname: () => '/app' }));

describe('LeftRail role visibility', () => {
  it.each(['subscriber', 'teacher'] as const)('hides school admin navigation for %s', (activeRole) => {
    render(<LeftRail activeWorkspaceKind={activeRole === 'teacher' ? 'school' : 'personal'} activeRole={activeRole} />);

    expect(screen.queryByRole('link', { name: 'Kelas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Analitik' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin sekolah' })).not.toBeInTheDocument();
  });

  it('shows school navigation only to a school admin in a school workspace', () => {
    render(<LeftRail activeWorkspaceKind="school" activeRole="school_admin" />);

    expect(screen.getByRole('link', { name: 'Kelas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Analitik' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin sekolah' })).toBeInTheDocument();
  });
});
