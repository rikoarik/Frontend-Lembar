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
  announcement: string;
  cacheScope: string;
  getCacheKey: (key: string) => string;
  registerCache: (key: string, clear: () => void) => () => void;
  switchWorkspace: (workspaceId: string) => boolean;
};

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

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(DEMO_WORKSPACES[0].id);
  const [announcement, setAnnouncement] = useState(
    `Workspace aktif: ${labelFor(DEMO_WORKSPACES[0])}`,
  );
  const cacheRef = useRef(new Map<string, CacheEntry>());

  const activeWorkspace =
    DEMO_WORKSPACES.find((workspace) => workspace.id === activeWorkspaceId) ?? DEMO_WORKSPACES[0];

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
      const nextWorkspace = DEMO_WORKSPACES.find((workspace) => workspace.id === workspaceId);
      if (!nextWorkspace || workspaceId === activeWorkspaceId) return false;
      clearCacheFor(activeWorkspaceId);
      setActiveWorkspaceId(workspaceId);
      setAnnouncement(`Workspace aktif: ${labelFor(nextWorkspace)}`);
      return true;
    },
    [activeWorkspaceId, clearCacheFor],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      activeWorkspace,
      workspaces: DEMO_WORKSPACES,
      announcement,
      cacheScope: activeWorkspace.id,
      getCacheKey,
      registerCache,
      switchWorkspace,
    }),
    [activeWorkspace, announcement, getCacheKey, registerCache, switchWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}

export type { Workspace };
