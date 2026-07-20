'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
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
  switchWorkspace: (workspaceId: string) => boolean;
};

// Seed data used in tests and as fallback during development
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

function labelFor(workspace: Workspace): string {
  return `${workspace.name} · ${workspace.kind === 'school' ? 'Sekolah' : 'Pribadi'}`;
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
  const workspaceList = initialWorkspaces ?? DEMO_WORKSPACES;
  const firstWorkspace = workspaceList[0];
  const resolvedActiveId = initialActiveId ?? firstWorkspace?.id ?? '';

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(resolvedActiveId);
  const [announcement, setAnnouncement] = useState(() => {
    const ws = workspaceList.find((w) => w.id === resolvedActiveId) ?? firstWorkspace;
    return ws ? `Workspace aktif: ${labelFor(ws)}` : '';
  });
  const cacheRef = useRef(new Map<string, CacheEntry>());

  const activeWorkspace =
    workspaceList.find((workspace) => workspace.id === activeWorkspaceId) ??
    firstWorkspace ??
    DEMO_WORKSPACES[0];

  const clearCacheFor = useCallback((workspaceId: string) => {
    for (const [key, entry] of cacheRef.current) {
      if (key.startsWith(`${workspaceId}:`)) {
        entry.clear();
        cacheRef.current.delete(key);
      }
    }
  }, []);

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
    (workspaceId: string) => {
      const nextWorkspace = workspaceList.find((workspace) => workspace.id === workspaceId);
      if (!nextWorkspace || workspaceId === activeWorkspaceId) return false;
      clearCacheFor(activeWorkspaceId);
      setActiveWorkspaceId(workspaceId);
      setAnnouncement(`Workspace aktif: ${labelFor(nextWorkspace)}`);
      return true;
    },
    [activeWorkspaceId, clearCacheFor, workspaceList],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeWorkspace,
      workspaces: workspaceList,
      displayName: initialDisplayName ?? 'Demo Guru',
      announcement,
      cacheScope: activeWorkspace.id,
      getCacheKey,
      registerCache,
      switchWorkspace,
    }),
    [activeWorkspace, workspaceList, initialDisplayName, announcement, getCacheKey, registerCache, switchWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}

export type { Workspace };
