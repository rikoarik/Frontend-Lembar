'use client';

import { useState } from 'react';
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

// Mock data until B1-02 lands
const MOCK_MEMBERSHIPS: WorkspaceMembership[] = [
  { id: 'ws-1', name: 'Workspace Pribadi', role: 'owner', isActive: true, isPersonal: true },
  { id: 'ws-2', name: 'SD Negeri 01 Maju', role: 'admin', isActive: false, isPersonal: false },
  { id: 'ws-3', name: 'Tim Guru Matematika', role: 'member', isActive: false, isPersonal: false },
];

const ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: 'Pemilik',
  admin: 'Admin',
  member: 'Anggota',
};

export default function WorkspaceSettingsPage() {
  const [memberships] = useState<WorkspaceMembership[]>(MOCK_MEMBERSHIPS);
  const [switchTarget, setSwitchTarget] = useState<WorkspaceMembership | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<WorkspaceMembership | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const handleSwitch = async () => {
    if (!switchTarget) return;
    setActionBusy(true);
    // mock until B1-02
    await new Promise((r) => setTimeout(r, 400));
    setActionBusy(false);
    setSwitchTarget(null);
    setActionStatus(`Beralih ke workspace "${switchTarget.name}".`);
  };

  const handleLeave = async () => {
    if (!leaveTarget) return;
    setActionBusy(true);
    // mock until B1-02
    await new Promise((r) => setTimeout(r, 400));
    setActionBusy(false);
    setLeaveTarget(null);
    setActionStatus(`Anda telah keluar dari workspace "${leaveTarget.name}".`);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-brand-ink font-semibold text-body-xl">Workspace</h1>

      {actionStatus && (
        <FormStatus tone="idle" message={actionStatus} />
      )}

      <Panel title="Keanggotaan workspace" description="Workspace yang Anda ikuti dan peran Anda di masing-masing.">
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
              <Button
                size="sm"
                onClick={handleSwitch}
                loading={actionBusy}
                disabled={actionBusy}
              >
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
                loading={actionBusy}
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
