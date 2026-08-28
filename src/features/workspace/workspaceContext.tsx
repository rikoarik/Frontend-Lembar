'use client';

import { Fragment, createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ActiveRole, WorkspaceKind } from '@/src/types/auth';

type Workspace = {
  id: string;
  name: string;
  kind: WorkspaceKind;
  activeRole: ActiveRole;
};

type CacheEntry = {
  clear: () => void;
};

type WorkspaceContextValue = {
  activeWorkspace: Workspace;
  workspaces: Workspace[];
  displayName: string;
  announcement: string;
  cacheScope: string;
  getCacheKey: (key: string) => string;
  registerCache: (key: string, clear: () => void) => () => void;
  switchWorkspace: (workspaceId: string) => Promise<boolean>;
};

// Seed data used as fallback during development only (never in production builds)
const DEMO_WORKSPACES: Workspace[] = [
  {
    id: 'ws_demo',
    name: 'Ruang pribadi',
    kind: 'personal',
    activeRole: 'teacher',
  },
  {
    id: 'ws_school_demo',
    name: 'SDN Contoh 01',
    kind: 'school',
    activeRole: 'school_admin',
  },
];

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const isLiveApi = () => process.env.NEXT_PUBLIC_API_MODE === 'live';

/** Demo seed data is allowed only outside production and only in mock API mode. */
const canUseDemoSeed = () => process.env.NODE_ENV !== 'production' && !isLiveApi();

function labelFor(workspace: Workspace, kindLabel: { personal: string; school: string }): string {
  return `${workspace.name} · ${workspace.kind === 'school' ? kindLabel.school : kindLabel.personal}`;
}

type WorkspaceProviderProps = {
  children: React.ReactNode;
  /** Real workspaces from /v1/me. Falls back to DEMO_WORKSPACES when omitted. */
  initialWorkspaces?: Workspace[];
  /** ID of the active workspace from /v1/me. Falls back to first workspace when omitted. */
  initialActiveId?: string;
  /** Display name from /v1/me account.displayName. Falls back to 'Demo Guru'. */
  initialDisplayName?: string;
};

export function WorkspaceProvider({
  children,
  initialWorkspaces,
  initialActiveId,
  initialDisplayName,
}: WorkspaceProviderProps) {
  const live = isLiveApi();
  const allowDemoSeed = canUseDemoSeed();
  const tWorkspace = useTranslations('workspace');
  const kindLabel = {
    personal: tWorkspace('personalLabel'),
    school: tWorkspace('schoolLabel'),
  };
  const fallbackWorkspaces = useMemo(() => (allowDemoSeed ? DEMO_WORKSPACES : []), [allowDemoSeed]);
  const workspaceList = initialWorkspaces ?? fallbackWorkspaces;
  const firstWorkspace = workspaceList[0];
  const resolvedActiveId = initialActiveId ?? firstWorkspace?.id ?? '';
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(resolvedActiveId);
  const ws = workspaceList.find((w) => w.id === activeWorkspaceId) ?? firstWorkspace;
  const announcement = ws
    ? tWorkspace('activeAnnouncement', {
        name: ws.name,
        kind: ws.kind === 'school' ? kindLabel.school : kindLabel.personal,
      })
    : '';
  const cacheRef = useRef(new Map<string, CacheEntry>());

  const activeWorkspace = useMemo(
    () =>
      workspaceList.find((workspace) => workspace.id === activeWorkspaceId) ??
      firstWorkspace ?? {
        id: '',
        name: tWorkspace('fallbackWorkspace'),
        kind: 'personal' as WorkspaceKind,
        activeRole: 'teacher' as ActiveRole,
      },
    [workspaceList, activeWorkspaceId, firstWorkspace, tWorkspace],
  );

  const getCacheKey = useCallback(
    (key: string) => `${activeWorkspaceId}:${key}`,
    [activeWorkspaceId],
  );

  const registerCache = useCallback(
    (key: string, clear: () => void) => {
      const scopedKey = `${activeWorkspaceId}:${key}`;
      cacheRef.current.set(scopedKey, { clear });
      return () => cacheRef.current.delete(scopedKey);
    },
    [activeWorkspaceId],
  );

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (workspaceId === activeWorkspaceId) return true;
      if (!workspaceList.some((workspace) => workspace.id === workspaceId)) return false;

      try {
        const response = await fetch('/v1/auth/workspace/switch', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId }),
        });
        if (!response.ok) return false;

        for (const entry of cacheRef.current.values()) {
          try {
            entry.clear();
          } catch {
            // A cache cleanup must not leave the workspace switch half-applied.
          }
        }
        cacheRef.current.clear();
        setActiveWorkspaceId(workspaceId);
        return true;
      } catch {
        return false;
      }
    },
    [activeWorkspaceId, workspaceList, setActiveWorkspaceId],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeWorkspace,
      workspaces: workspaceList,
      displayName: initialDisplayName ?? (allowDemoSeed ? 'Demo Guru' : tWorkspace('fallbackUser')),
      announcement,
      cacheScope: activeWorkspace.id,
      getCacheKey,
      registerCache,
      switchWorkspace,
    }),
    [
      activeWorkspace,
      workspaceList,
      initialDisplayName,
      announcement,
      allowDemoSeed,
      tWorkspace,
      getCacheKey,
      registerCache,
      switchWorkspace,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      <Fragment key={activeWorkspace.id}>{children}</Fragment>
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}

export type { Workspace };
