'use client';

import { useEffect, useState } from 'react';
import { Panel, Button } from '@/app/components/ui';
import FormStatus from '@/app/(auth)/components/FormStatus';

type WorkspaceRole = 'owner' | 'admin' | 'member';

interface WorkspaceMembership {
  id: string;
  name: string;
  role: WorkspaceRole;
  isActive: boolean;
  isPersonal: boolean;
}

interface MeWorkspace {
  id: string;
  name: string;
  type: string;
  role: string;
  permissions?: string[];
}

interface MeResponse {
  data?: { activeWorkspaceId?: string; workspaces?: MeWorkspace[] };
}

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: 'Pemilik',
  admin: 'Admin',
  member: 'Anggota',
};

function mapRole(backendRole: string): WorkspaceRole {
  if (backendRole === 'admin') return 'admin';
  if (backendRole === 'member') return 'member';
  return 'owner';
}

export default function WorkspaceSettingsPage() {
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchTarget, setSwitchTarget] = useState<WorkspaceMembership | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<WorkspaceMembership | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const res = await fetch('/v1/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Gagal memuat data workspace');
        const json = await res.json() as MeResponse;
        const raw = json.data?.workspaces ?? [];
        const activeWorkspaceId = json.data?.activeWorkspaceId;
        const mapped: WorkspaceMembership[] = raw.map((w) => ({
          id: w.id,
          name: w.name,
          role: mapRole(w.role),
          isActive: w.id === activeWorkspaceId,
          isPersonal: w.type === 'personal',
        }));

        if (!mapped.some((workspace) => workspace.isActive) && mapped.length > 0) {
          mapped[0].isActive = true;
        }

        setMemberships(mapped);
      } catch {
        setActionStatus('Gagal memuat data workspace.');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaces();
  }, []);

  const handleSwitch = async () => {
    if (!switchTarget) return;
    setActionBusy(true);
    try {
      const res = await fetch('/v1/auth/workspace/switch', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: switchTarget.id }),
      });
      if (!res.ok) throw new Error('Gagal beralih workspace');
      window.location.reload();
    } catch {
      setActionBusy(false);
      setSwitchTarget(null);
      setActionStatus(`Gagal beralih ke workspace "${switchTarget.name}".`);
    }
  };

  const handleLeave = async () => {
    if (!leaveTarget) return;
    setLeaveTarget(null);
    setActionStatus('Fitur keluar workspace belum tersedia');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-brand-ink font-semibold text-body-xl">Workspace</h1>
        <Panel title="Keanggotaan workspace" description="Memuat data…">
          <div className="flex items-center justify-center py-8">
            <span className="text-body-sm text-brand-muted">Memuat…</span>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-brand-ink font-semibold text-body-xl">Workspace</h1>

      {actionStatus && <FormStatus tone="idle" message={actionStatus} />}

      <Panel
        title="Keanggotaan workspace"
        description="Workspace yang Anda ikuti dan peran Anda di masing-masing."
      >
        {memberships.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-body-sm text-brand-muted">Tidak ada workspace ditemukan.</span>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Daftar workspace">
            {memberships.map((ws) => (
              <li
                key={ws.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 border border-brand-line rounded-md p-3 bg-brand-paper"
              >
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-medium text-brand-ink">{ws.name}</span>
                    {ws.isActive && (
                      <span
                        className="text-label-xs text-brand-accent bg-brand-accent/10 rounded px-1.5 py-0.5"
                        aria-label="workspace aktif"
                      >
                        Aktif
                      </span>
                    )}
                  </div>
                  <span className="text-body-xs text-brand-muted">{ROLE_LABEL[ws.role]}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!ws.isActive && (
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        setActionStatus('');
                        setSwitchTarget(ws);
                      }}
                    >
                      Pilih
                    </Button>
                  )}
                  {!ws.isPersonal && ws.role !== 'owner' && (
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        setActionStatus('');
                        setLeaveTarget(ws);
                      }}
                    >
                      Keluar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Switch workspace confirmation */}
      {switchTarget && (
        <Panel title="Beralih workspace">
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-brand-ink">
              Beralih ke workspace <strong>{switchTarget.name}</strong>? Perubahan yang belum
              disimpan akan hilang.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSwitch} loading={actionBusy} disabled={actionBusy}>
                {actionBusy ? 'Beralih…' : 'Ya, beralih'}
              </Button>
              <Button variant="quiet" size="sm" onClick={() => setSwitchTarget(null)}>
                Batal
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Leave workspace confirmation */}
      {leaveTarget && (
        <Panel title="Keluar dari workspace">
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-brand-ink">
              Yakin ingin keluar dari workspace <strong>{leaveTarget.name}</strong>? Anda tidak
              dapat mengakses workspace ini setelah keluar.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleLeave}
                disabled={actionBusy}
              >
                {actionBusy ? 'Keluar…' : 'Ya, keluar'}
              </Button>
              <Button variant="quiet" size="sm" onClick={() => setLeaveTarget(null)}>
                Batal
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
