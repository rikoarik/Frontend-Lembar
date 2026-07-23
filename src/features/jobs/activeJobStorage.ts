const PREFIX = 'lembar:active-job:';

export type ActiveJobRecord = {
  jobId: string;
  workspaceId: string;
  reviewMode?: 'quick' | 'detail';
  savedAt: string;
};

export function activeJobStorageKey(workspaceId: string): string {
  return `${PREFIX}${workspaceId}`;
}

export function readActiveJob(workspaceId: string): ActiveJobRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(activeJobStorageKey(workspaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveJobRecord;
    if (!parsed?.jobId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeActiveJob(record: ActiveJobRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(activeJobStorageKey(record.workspaceId), JSON.stringify(record));
  } catch {
    // sessionStorage may be unavailable (private mode / quota)
  }
}

export function clearActiveJob(workspaceId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(activeJobStorageKey(workspaceId));
  } catch {
    // ignore
  }
}
