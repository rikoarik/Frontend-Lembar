import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceProvider, useWorkspace } from '@/src/features/workspace/workspaceContext';

function Probe() {
  const { activeWorkspace, getCacheKey, registerCache, switchWorkspace } = useWorkspace();
  return (
    <div>
      <p data-testid="workspace">{activeWorkspace.id}</p>
      <p data-testid="cache-key">{getCacheKey('dashboard')}</p>
      <button
        type="button"
        onClick={() => {
          registerCache('dashboard', () => {
            window.localStorage.setItem('cleared', 'yes');
          });
        }}
      >
        register
      </button>
      <button type="button" onClick={() => switchWorkspace('ws_school_demo')}>
        switch
      </button>
    </div>
  );
}

describe('WorkspaceContext', () => {
  it('scopes cache keys by active workspace', () => {
    render(
      <WorkspaceProvider>
        <Probe />
      </WorkspaceProvider>,
    );

    expect(screen.getByTestId('workspace')).toHaveTextContent('ws_demo');
    expect(screen.getByTestId('cache-key')).toHaveTextContent('ws_demo:dashboard');
  });

  it('clears registered cache on workspace switch', async () => {
    const user = userEvent.setup();
    render(
      <WorkspaceProvider>
        <Probe />
      </WorkspaceProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'register' }));
    await user.click(screen.getByRole('button', { name: 'switch' }));

    expect(window.localStorage.getItem('cleared')).toBe('yes');
    expect(screen.getByTestId('workspace')).toHaveTextContent('ws_school_demo');
    expect(screen.getByTestId('cache-key')).toHaveTextContent('ws_school_demo:dashboard');
  });
});
