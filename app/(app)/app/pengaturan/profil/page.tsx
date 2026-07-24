'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';
import FormField from '@/app/(auth)/components/FormField';
import FormStatus from '@/app/(auth)/components/FormStatus';

export default function ProfileSettingsPage() {
  // Profile Info State
  const [displayName, setDisplayName] = useState('Guru Demo');
  const [nameError, setNameError] = useState('');
  const [nameStatus, setNameStatus] = useState('');
  const [nameBusy, setNameBusy] = useState(false);

  // Email State
  const [email, setEmail] = useState('guru@lembar.id');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  // Session / Logout All State
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState('');
  const [logoutBusy, setLogoutBusy] = useState(false);

  // Preferences
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(true);
  const [prefStatus, setPrefStatus] = useState('');

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'G';

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setNameError('Nama tampilan wajib diisi.');
      return;
    }
    setNameError('');
    setNameBusy(true);
    await new Promise((r) => setTimeout(r, 300));
    setNameBusy(false);
    setNameStatus('Nama tampilan disimpan.');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setEmailError('Masukkan alamat email yang valid.');
      return;
    }
    setEmailError('');
    setEmailBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    setEmailBusy(false);
    setEmail(newEmail);
    setNewEmail('');
    setShowEmailForm(false);
    setEmailStatus('Alamat email berhasil diperbarui.');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Kata sandi saat ini wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setPasswordError('');
    setPasswordBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    setPasswordBusy(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
    setPasswordStatus('Kata sandi berhasil diperbarui.');
  };

  const handleLogoutAll = async () => {
    setLogoutBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    setLogoutBusy(false);
    setLogoutConfirm(false);
    setLogoutStatus('Semua perangkat telah dikeluarkan.');
  };

  const handleSavePreferences = () => {
    setPrefStatus('Preferensi notifikasi disimpan.');
    setTimeout(() => setPrefStatus(''), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-brand-ink font-semibold text-body-xl">Profil</h1>
        <p className="text-body-sm text-[#6d665d]">
          Kelola informasi pribadi, email, kata sandi, dan sesi akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        {/* Kolom Kiri */}
        <div className="flex flex-col gap-5">
          {/* Profile Card Header */}
          <div className="flex items-center gap-4 rounded-xl border border-[#e6dfd4] bg-white p-4 shadow-xs">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#a3202b] text-[18px] font-bold text-white shadow-xs">
              {initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[16px] font-semibold text-[#171717]">{displayName}</h2>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                  Terverifikasi
                </span>
              </div>
              <p className="truncate text-body-sm text-[#6d665d]">{email}</p>
            </div>
          </div>

          {/* Informasi Pribadi Panel */}
          <Panel title="Nama tampilan" description="Nama yang terlihat oleh tim di workspace.">
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-3.5" noValidate>
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

          {/* Alamat Email Panel */}
          <Panel title="Alamat email" description="Alamat email untuk masuk dan notifikasi.">
            <div className="flex flex-col gap-3.5">
              {emailStatus ? <FormStatus tone="idle" message={emailStatus} /> : null}

              <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e6dfd4] bg-[#fbf8f2] p-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-[#8a8379]">Email utama</span>
                  <span className="truncate text-[13px] font-medium text-[#171717]">{email}</span>
                </div>
                {!showEmailForm && (
                  <Button
                    type="button"
                    variant="quiet"
                    size="sm"
                    onClick={() => setShowEmailForm(true)}
                  >
                    Ubah email
                  </Button>
                )}
              </div>

              {showEmailForm && (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 pt-1" noValidate>
                  <FormField label="Email baru" error={emailError || undefined}>
                    {(props) => (
                      <input
                        {...props}
                        type="email"
                        placeholder="nama@domain.com"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        autoComplete="email"
                      />
                    )}
                  </FormField>
                  <div className="flex gap-2">
                    <Button type="submit" loading={emailBusy} disabled={emailBusy} size="sm">
                      {emailBusy ? 'Memperbarui…' : 'Simpan email baru'}
                    </Button>
                    <Button
                      type="button"
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        setShowEmailForm(false);
                        setEmailError('');
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Panel>
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col gap-5">
          {/* Keamanan Akun Panel */}
          <Panel title="Keamanan akun" description="Kelola kata sandi dan sesi aktif Anda.">
            <div className="flex flex-col gap-4">
              {passwordStatus ? <FormStatus tone="idle" message={passwordStatus} /> : null}

              {!showPasswordForm ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e6dfd4] bg-[#fbf8f2] p-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-[#171717]">Kata Sandi</span>
                    <span className="text-[11px] text-[#6d665d]">Diperbarui via akun</span>
                  </div>
                  <Button
                    type="button"
                    variant="quiet"
                    size="sm"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Ubah kata sandi
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3 rounded-lg border border-[#e6dfd4] bg-white p-3.5" noValidate>
                  <h3 className="text-[13px] font-semibold text-[#171717]">Ubah Kata Sandi</h3>
                  {passwordError ? <FormStatus tone="alert" message={passwordError} /> : null}

                  <FormField label="Kata sandi saat ini">
                    {(props) => (
                      <input
                        {...props}
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    )}
                  </FormField>

                  <FormField label="Kata sandi baru">
                    {(props) => (
                      <input
                        {...props}
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    )}
                  </FormField>

                  <FormField label="Konfirmasi kata sandi baru">
                    {(props) => (
                      <input
                        {...props}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    )}
                  </FormField>

                  <div className="flex gap-2 pt-1">
                    <Button type="submit" loading={passwordBusy} disabled={passwordBusy} size="sm">
                      {passwordBusy ? 'Memperbarui…' : 'Simpan kata sandi baru'}
                    </Button>
                    <Button
                      type="button"
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordError('');
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              )}

              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/lupa-sandi"
                  className="text-body-xs text-brand-accent underline underline-offset-4 hover:text-brand-accent-hover self-start"
                >
                  Ubah kata sandi via link email
                </Link>

                {!logoutConfirm ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setLogoutConfirm(true)}
                    className="self-start"
                  >
                    Keluar dari semua perangkat
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2.5 rounded-lg border border-brand-line p-3 bg-brand-paper">
                    <p className="text-body-xs text-brand-ink">
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
            </div>
          </Panel>

          {/* Preferensi Notifikasi Panel */}
          <Panel title="Notifikasi" description="Atur notifikasi yang ingin Anda terima via email.">
            <div className="flex flex-col gap-3.5">
              {prefStatus ? <FormStatus tone="idle" message={prefStatus} /> : null}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnComplete}
                  onChange={(e) => {
                    setNotifyOnComplete(e.target.checked);
                    handleSavePreferences();
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-brand-line text-brand-accent focus:ring-brand-accent"
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#171717]">Status Pembuatan Lembar</span>
                  <span className="text-[11px] text-[#6d665d]">Email saat AI selesai membuat lembar</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyNewsletter}
                  onChange={(e) => {
                    setNotifyNewsletter(e.target.checked);
                    handleSavePreferences();
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-brand-line text-brand-accent focus:ring-brand-accent"
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#171717]">Pembaruan Fitur &amp; Tips</span>
                  <span className="text-[11px] text-[#6d665d]">Info fitur terbaru dan panduan pembuatan soal</span>
                </div>
              </label>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
