'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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

function mapRole(backendRole: string, workspaceType: string): WorkspaceRole {
  if (workspaceType === 'personal' || backendRole === 'owner' || backendRole === 'superadmin') {
    return 'owner';
  }
  if (backendRole === 'admin' || backendRole === 'school_admin') return 'admin';
  return 'member';
}

export default function WorkspaceSettingsPage() {
  const t = useTranslations('settings.workspace');
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchTarget, setSwitchTarget] = useState<WorkspaceMembership | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const res = await fetch('/v1/me', { credentials: 'include' });
        if (!res.ok) throw new Error(t('error.load'));
        const json = (await res.json()) as MeResponse;
        const raw = json.data?.workspaces ?? [];
        const activeWorkspaceId = json.data?.activeWorkspaceId;
        const mapped: WorkspaceMembership[] = raw.map((w) => ({
          id: w.id,
          name: w.name,
          role: mapRole(w.role, w.type),
          isActive: w.id === activeWorkspaceId,
          isPersonal: w.type === 'personal',
        }));

        if (!mapped.some((workspace) => workspace.isActive) && mapped.length > 0) {
          mapped[0].isActive = true;
        }

        setMemberships(mapped);
      } catch {
        setActionStatus(t('error.load'));
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspaces();
    // The translator identity is stable per locale; re-fetching on every render is not desired.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!res.ok) throw new Error('switch failed');
      window.location.reload();
    } catch {
      setActionBusy(false);
      setSwitchTarget(null);
      setActionStatus(t('error.switch', { name: switchTarget.name }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-brand-ink font-semibold text-body-xl">{t('title')}</h1>
        <Panel title={t('membershipTitle')} description={t('loading')}>
          <div className="flex items-center justify-center py-8">
            <span className="text-body-sm text-brand-muted">{t('loading')}</span>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-brand-ink font-semibold text-body-xl">{t('title')}</h1>

      {actionStatus && <FormStatus tone="idle" message={actionStatus} />}

      <Panel title={t('membershipTitle')} description={t('membershipDescription')}>
        {memberships.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-body-sm text-brand-muted">{t('empty')}</span>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label={t('listAria')}>
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
                        aria-label={t('activeAria')}
                      >
                        {t('activeBadge')}
                      </span>
                    )}
                  </div>
                  <span className="text-body-xs text-brand-muted">{t(`roles.${ws.role}`)}</span>
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
                      {t('select')}
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
        <Panel title={t('switchTitle')}>
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-brand-ink">
              {t('switchConfirm', { name: switchTarget.name })}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSwitch} loading={actionBusy} disabled={actionBusy}>
                {actionBusy ? t('switchBusy') : t('switchSubmit')}
              </Button>
              <Button variant="quiet" size="sm" onClick={() => setSwitchTarget(null)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <p className="text-body-xs text-brand-muted">{t('managedByAdmin')}</p>
    </div>
  );
}
