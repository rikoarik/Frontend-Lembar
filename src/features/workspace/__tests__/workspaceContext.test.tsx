import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceProvider, useWorkspace } from '@/src/features/workspace/workspaceContext';
import type { Workspace } from '@/src/features/workspace/workspaceContext';

const PERSONAL_WS: Workspace = {
  id: 'ws-1',
  name: 'Ruang Saya',
  kind: 'personal',
  activeRole: 'teacher',
};
const SCHOOL_WS: Workspace = {
  id: 'ws-2',
  name: 'SDN 01',
  kind: 'school',
  activeRole: 'school_admin',
};

function Probe() {
  const { activeWorkspace, workspaces, displayName, getCacheKey, registerCache, switchWorkspace } =
    useWorkspace();
  return (
    <div>
      <p data-testid="workspace-id">{activeWorkspace.id}</p>
      <p data-testid="workspace-name">{activeWorkspace.name}</p>
      <p data-testid="display-name">{displayName}</p>
      <p data-testid="cache-key">{getCacheKey('dashboard')}</p>
      <p data-testid="workspace-count">{workspaces.length}</p>
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
      <button type="button" onClick={() => switchWorkspace('ws-2')}>
        switch
      </button>
    </div>
  );
}

function StatefulChild() {
  const { activeWorkspace, switchWorkspace } = useWorkspace();
  const [localCount, setLocalCount] = useState(0);

  return (
    <div>
      <p data-testid="stateful-workspace-id">{activeWorkspace.id}</p>
      <p data-testid="local-count">{localCount}</p>
      <button type="button" onClick={() => setLocalCount((count) => count + 1)}>
        increment local state
      </button>
      <button type="button" onClick={() => switchWorkspace('ws-2')}>
        switch stateful child
      </button>
    </div>
  );
}

describe('WorkspaceContext — F2-03 real data injection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });
  it('uses initialWorkspaces and initialActiveId from props', () => {
    render(
      <WorkspaceProvider
        initialWorkspaces={[PERSONAL_WS, SCHOOL_WS]}
        initialActiveId="ws-1"
        initialDisplayName="Budi Santoso"
      >
        <Probe />
      </WorkspaceProvider>,
    );

    expect(screen.getByTestId('workspace-id')).toHaveTextContent('ws-1');
    expect(screen.getByTestId('workspace-name')).toHaveTextContent('Ruang Saya');
    expect(screen.getByTestId('display-name')).toHaveTextContent('Budi Santoso');
    expect(screen.getByTestId('workspace-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cache-key')).toHaveTextContent('ws-1:dashboard');
  });

  it('falls back to DEMO data when no props supplied (backward compat)', () => {
    render(
      <WorkspaceProvider>
        <Probe />
      </WorkspaceProvider>,
    );

    expect(screen.getByTestId('workspace-id')).toHaveTextContent('ws_demo');
    expect(screen.getByTestId('display-name')).toHaveTextContent('Demo Guru');
  });

  it('switches through the BFF and clears workspace-scoped caches', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const user = userEvent.setup();
    render(
      <WorkspaceProvider
        initialWorkspaces={[PERSONAL_WS, SCHOOL_WS]}
        initialActiveId="ws-1"
        initialDisplayName="Budi Santoso"
      >
        <Probe />
      </WorkspaceProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'register' }));
    await user.click(screen.getByRole('button', { name: 'switch' }));

    expect(fetch).toHaveBeenCalledWith(
      '/v1/auth/workspace/switch',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(window.localStorage.getItem('cleared')).toBe('yes');
    expect(screen.getByTestId('workspace-id')).toHaveTextContent('ws-2');
    expect(screen.getByTestId('cache-key')).toHaveTextContent('ws-2:dashboard');
  });

  it('remounts descendants and resets local state after a successful switch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const user = userEvent.setup();
    render(
      <WorkspaceProvider initialWorkspaces={[PERSONAL_WS, SCHOOL_WS]} initialActiveId="ws-1">
        <StatefulChild />
      </WorkspaceProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'increment local state' }));
    expect(screen.getByTestId('local-count')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'switch stateful child' }));

    await waitFor(() => {
      expect(screen.getByTestId('stateful-workspace-id')).toHaveTextContent('ws-2');
      expect(screen.getByTestId('local-count')).toHaveTextContent('0');
    });
  });

  it('scopes cache keys by active workspace id', () => {
    render(
      <WorkspaceProvider initialWorkspaces={[PERSONAL_WS, SCHOOL_WS]} initialActiveId="ws-2">
        <Probe />
      </WorkspaceProvider>,
    );

    expect(screen.getByTestId('cache-key')).toHaveTextContent('ws-2:dashboard');
  });
});
