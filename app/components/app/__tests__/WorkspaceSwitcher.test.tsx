import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceSwitcher } from '../WorkspaceSwitcher';

describe('WorkspaceSwitcher', () => {
  it('menampilkan semua tipe workspace tanpa menawarkan switch palsu', async () => {
    render(
      <WorkspaceSwitcher
        activeWorkspaceId="personal"
        onSelect={vi.fn()}
        workspaces={[
          { id: 'personal', name: 'Pribadi', kind: 'personal', activeRole: 'teacher' },
          { id: 'school', name: 'Sekolah', kind: 'school', activeRole: 'teacher' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /workspace pribadi/i }));
    expect(screen.getByRole('option', { name: /Sekolah/ })).toBeDisabled();
  });
});