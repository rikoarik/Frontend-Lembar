import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceSwitcher } from '../WorkspaceSwitcher';

describe('WorkspaceSwitcher', () => {
  it('offers accessible switching for inactive workspaces', async () => {
    const onSelect = vi.fn().mockResolvedValue(true);
    const user = userEvent.setup();
    render(
      <WorkspaceSwitcher
        activeWorkspaceId="personal"
        onSelect={onSelect}
        workspaces={[
          { id: 'personal', name: 'Pribadi', kind: 'personal', activeRole: 'teacher' },
          { id: 'school', name: 'Sekolah', kind: 'school', activeRole: 'teacher' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: /workspace pribadi/i }));
    const school = screen.getByRole('option', { name: /Sekolah/ });
    expect(school).toBeEnabled();
    await user.click(school);
    expect(onSelect).toHaveBeenCalledWith('school');
  });
});
