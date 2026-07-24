'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type SectionState = {
  search: string;
  filter: string;
  selectedIds: string[];
};

type CacheEntry = {
  clear: () => void;
};

type AdminPanelContextValue = {
  panelId: string;
  getSectionState: (section: string) => SectionState;
  setSearch: (section: string, value: string) => void;
  setFilter: (section: string, value: string) => void;
  setSelectedIds: (section: string, ids: string[]) => void;
  toggleSelectedId: (section: string, id: string) => void;
  toast: string | null;
  setToast: (message: string | null) => void;
  cacheScope: string;
  getCacheKey: (key: string) => string;
  registerCache: (key: string, clear: () => void) => () => void;
  clearPanelCache: () => void;
};

const DEFAULT_SECTION: SectionState = {
  search: '',
  filter: 'all',
  selectedIds: [],
};

const AdminPanelContext = createContext<AdminPanelContextValue | null>(null);

export function AdminPanelProvider({
  panelId,
  children,
}: {
  panelId: string;
  children: ReactNode;
}) {
  const [sectionMap, setSectionMap] = useState<Record<string, SectionState>>({});
  const [toast, setToast] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, CacheEntry>());

  const getSectionState = useCallback(
    (section: string): SectionState => sectionMap[section] ?? DEFAULT_SECTION,
    [sectionMap],
  );

  const patchSection = useCallback((section: string, patch: Partial<SectionState>) => {
    setSectionMap((prev) => {
      const current = prev[section] ?? DEFAULT_SECTION;
      return {
        ...prev,
        [section]: { ...current, ...patch },
      };
    });
  }, []);

  const setSearch = useCallback(
    (section: string, value: string) => patchSection(section, { search: value }),
    [patchSection],
  );

  const setFilter = useCallback(
    (section: string, value: string) => patchSection(section, { filter: value }),
    [patchSection],
  );

  const setSelectedIds = useCallback(
    (section: string, ids: string[]) => patchSection(section, { selectedIds: ids }),
    [patchSection],
  );

  const toggleSelectedId = useCallback((section: string, id: string) => {
    setSectionMap((prev) => {
      const current = prev[section] ?? DEFAULT_SECTION;
      const exists = current.selectedIds.includes(id);
      return {
        ...prev,
        [section]: {
          ...current,
          selectedIds: exists
            ? current.selectedIds.filter((item) => item !== id)
            : [...current.selectedIds, id],
        },
      };
    });
  }, []);

  const getCacheKey = useCallback((key: string) => `${panelId}:${key}`, [panelId]);

  const registerCache = useCallback(
    (key: string, clear: () => void) => {
      const scoped = getCacheKey(key);
      cacheRef.current.set(scoped, { clear });
      return () => {
        cacheRef.current.delete(scoped);
      };
    },
    [getCacheKey],
  );

  const clearPanelCache = useCallback(() => {
    for (const entry of cacheRef.current.values()) {
      entry.clear();
    }
    cacheRef.current.clear();
  }, []);

  const value = useMemo<AdminPanelContextValue>(
    () => ({
      panelId,
      getSectionState,
      setSearch,
      setFilter,
      setSelectedIds,
      toggleSelectedId,
      toast,
      setToast,
      cacheScope: panelId,
      getCacheKey,
      registerCache,
      clearPanelCache,
    }),
    [
      panelId,
      getSectionState,
      setSearch,
      setFilter,
      setSelectedIds,
      toggleSelectedId,
      toast,
      getCacheKey,
      registerCache,
      clearPanelCache,
    ],
  );

  return <AdminPanelContext.Provider value={value}>{children}</AdminPanelContext.Provider>;
}

export function useAdminPanel() {
  const ctx = useContext(AdminPanelContext);
  if (!ctx) {
    throw new Error('useAdminPanel must be used within AdminPanelProvider');
  }
  return ctx;
}

export function useAdminSectionState(section: string) {
  const panel = useAdminPanel();
  const state = panel.getSectionState(section);
  return {
    search: state.search,
    filter: state.filter,
    selectedIds: state.selectedIds,
    setSearch: (value: string) => panel.setSearch(section, value),
    setFilter: (value: string) => panel.setFilter(section, value),
    setSelectedIds: (ids: string[]) => panel.setSelectedIds(section, ids),
    toggleSelectedId: (id: string) => panel.toggleSelectedId(section, id),
    setToast: panel.setToast,
  };
}
