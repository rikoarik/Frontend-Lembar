'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';
import FormField from '@/app/(auth)/components/FormField';
import FormStatus from '@/app/(auth)/components/FormStatus';

export default function ProfileSettingsPage() {
  const [displayName, setDisplayName] = useState('Guru Demo');
  const [nameError, setNameError] = useState('');
  const [nameStatus, setNameStatus] = useState('');
  const [nameBusy, setNameBusy] = useState(false);

  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState('');
  const [logoutBusy, setLogoutBusy] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setNameError('Nama tampilan wajib diisi.');
      return;
    }
    setNameError('');
    setNameBusy(true);
    // mock
    await new Promise((r) => setTimeout(r, 300));
    setNameBusy(false);
    setNameStatus('Nama tampilan disimpan.');
  };

  const handleLogoutAll = async () => {
    setLogoutBusy(true);
    // mock
    await new Promise((r) => setTimeout(r, 500));
    setLogoutBusy(false);
    setLogoutConfirm(false);
    setLogoutStatus('Semua perangkat telah dikeluarkan.');
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-brand-ink font-semibold text-body-xl">Profil</h1>

      <Panel title="Nama tampilan" description="Nama yang terlihat oleh tim di workspace.">
        <form onSubmit={handleNameSubmit} className="flex flex-col gap-3 max-w-md" noValidate>
          {nameStatus ? <FormStatus tone="idle" message={nameStatus} /> : null}
          <FormField label="Nama tampilan" error={nameError || undefined}>
            {(props) => (
              <input
                {...props}
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError('');
                  if (nameStatus) setNameStatus('');
                }}
                autoComplete="name"
              />
            )}
          </FormField>
          <Button type="submit" loading={nameBusy} disabled={nameBusy} className="self-start">
            {nameBusy ? 'Menyimpan…' : 'Simpan nama'}
          </Button>
        </form>
      </Panel>

      <Panel title="Keamanan akun" description="Kelola kata sandi dan sesi aktif.">
        <div className="flex flex-col gap-3 max-w-md">
          <Link
            href="/lupa-sandi"
            className="text-brand-accent underline underline-offset-4 hover:text-brand-accent-hover"
          >
            Ubah kata sandi
          </Link>

          {!logoutConfirm ? (
            <Button
              variant="danger"
              onClick={() => setLogoutConfirm(true)}
              className="self-start"
            >
              Keluar dari semua perangkat
            </Button>
          ) : (
            <div className="flex flex-col gap-3 border border-brand-line rounded-md p-3 bg-brand-paper">
              <p className="text-body-sm text-brand-ink">
                Semua sesi aktif akan diakhiri. Anda harus masuk kembali di semua perangkat.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogoutAll}
                  loading={logoutBusy}
                  disabled={logoutBusy}
                >
                  {logoutBusy ? 'Mengeluarkan…' : 'Ya, keluarkan semua'}
                </Button>
                <Button variant="quiet" size="sm" onClick={() => setLogoutConfirm(false)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
          {logoutStatus && <FormStatus tone="idle" message={logoutStatus} />}
        </div>
      </Panel>
    </div>
  );
}
