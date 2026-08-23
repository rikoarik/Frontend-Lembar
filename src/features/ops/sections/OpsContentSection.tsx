import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminContentLoading, AdminPageHeader, AdminPill } from '@/src/features/admin/AdminChrome';
import {
  adminService,
  type AdminAnnouncement,
  type MarketingOpsPage,
  type MarketingPageSlug,
} from '@/src/services/admin/adminService';

const PAGES: { slug: MarketingPageSlug; label: string; href: string }[] = [
  { slug: 'home', label: 'Beranda', href: '/' },
  { slug: 'harga', label: 'Harga', href: '/harga' },
  { slug: 'untuk-sekolah', label: 'Untuk sekolah', href: '/untuk-sekolah' },
];

type AnnouncementDraft = Omit<AdminAnnouncement, 'revision' | 'updatedAt'>;

function toAnnouncementDraft(value: AdminAnnouncement): AnnouncementDraft {
  return {
    enabled: value.enabled,
    label: value.label,
    message: value.message,
    ctaLabel: value.ctaLabel,
    ctaHref: value.ctaHref,
  };
}

function isValidAnnouncementHref(value: string): boolean {
  if (!value) return true;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith('/')) return !value.startsWith('//');
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function OpsContentSection({ setToast }: { setToast: (message: string) => void }) {
  const [selected, setSelected] = useState<MarketingPageSlug>('home');
  const [page, setPage] = useState<MarketingOpsPage | null>(null);
  const [draftJson, setDraftJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [announcementDraft, setAnnouncementDraft] = useState<AnnouncementDraft | null>(null);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');

  const requestPage = useCallback(
    (slug: MarketingPageSlug) => {
      adminService.marketingPage(slug).then((result) => {
        if (result.ok) {
          setPage(result.value);
          setDraftJson(result.value.draft ? JSON.stringify(result.value.draft, null, 2) : '');
        } else {
          setToast(`Gagal memuat konten: ${result.error.safeMessage}`);
        }
        setLoading(false);
      });
    },
    [setToast],
  );

  const requestAnnouncement = useCallback(() => {
    setAnnouncementLoading(true);
    setAnnouncementError('');
    adminService.announcement().then((result) => {
      if (result.ok) {
        setAnnouncement(result.value);
        setAnnouncementDraft(toAnnouncementDraft(result.value));
      } else {
        setAnnouncementError(result.error.safeMessage);
      }
      setAnnouncementLoading(false);
    });
  }, []);

  const load = (slug = selected) => {
    setLoading(true);
    requestPage(slug);
  };

  useEffect(() => {
    void adminService.announcement().then((result) => {
      if (result.ok) {
        setAnnouncement(result.value);
        setAnnouncementDraft(toAnnouncementDraft(result.value));
      } else {
        setAnnouncementError(result.error.safeMessage);
      }
      setAnnouncementLoading(false);
    });
  }, []);

  useEffect(() => {
    requestPage(selected);
  }, [requestPage, selected]);

  const save = () => {
    if (!page) return;
    let draft: unknown;
    try {
      draft = JSON.parse(draftJson);
    } catch {
      setToast('JSON draft tidak valid.');
      return;
    }
    setSaving(true);
    adminService.saveMarketingDraft(selected, draft, page.summary.revision).then((result) => {
      setSaving(false);
      if (result.ok) {
        setPage(result.value);
        setDraftJson(JSON.stringify(result.value.draft, null, 2));
        setToast('Draft tersimpan.');
      } else
        setToast(
          result.error.code === 'STATE_CONFLICT'
            ? 'Draft berubah di tempat lain. Muat ulang sebelum menyimpan.'
            : `Gagal menyimpan: ${result.error.safeMessage}`,
        );
    });
  };

  const saveAnnouncement = () => {
    if (!announcement || !announcementDraft) return;
    const label = announcementDraft.label.trim();
    const message = announcementDraft.message.trim();
    const ctaLabel = announcementDraft.ctaLabel?.trim() ?? '';
    const ctaHref = announcementDraft.ctaHref?.trim() ?? '';

    if (!label || label.length > 40 || !message || message.length > 240) {
      setAnnouncementError(
        'Label wajib diisi maksimal 40 karakter dan pesan maksimal 240 karakter.',
      );
      return;
    }
    if (Boolean(ctaLabel) !== Boolean(ctaHref)) {
      setAnnouncementError(
        'Label dan URL tombol harus diisi bersamaan, atau keduanya dikosongkan.',
      );
      return;
    }
    if (ctaLabel.length > 80 || ctaHref.length > 500 || !isValidAnnouncementHref(ctaHref)) {
      setAnnouncementError('CTA tidak valid. Gunakan path internal /... atau URL https://.');
      return;
    }

    setAnnouncementSaving(true);
    setAnnouncementError('');
    adminService
      .updateAnnouncement(
        {
          enabled: announcementDraft.enabled,
          label,
          message,
          ctaLabel: ctaLabel || null,
          ctaHref: ctaHref || null,
        },
        announcement.revision,
      )
      .then((result) => {
        setAnnouncementSaving(false);
        if (result.ok) {
          setAnnouncement(result.value);
          setAnnouncementDraft(toAnnouncementDraft(result.value));
          setToast('Pengumuman global diperbarui.');
        } else {
          setAnnouncementError(
            result.error.code === 'STATE_CONFLICT'
              ? 'Pengumuman berubah di tempat lain. Muat ulang sebelum menyimpan.'
              : result.error.safeMessage,
          );
        }
      });
  };

  const changePublication = (action: 'publish' | 'unpublish') => {
    if (!page || !window.confirm(`${action === 'publish' ? 'Terbitkan' : 'Tarik'} halaman ini?`))
      return;
    setSaving(true);
    adminService[action === 'publish' ? 'publishPage' : 'unpublishPage'](
      selected,
      page.summary.revision,
    ).then((result) => {
      setSaving(false);
      if (result.ok) {
        setPage(result.value);
        setToast(action === 'publish' ? 'Halaman diterbitkan.' : 'Halaman ditarik dari publik.');
      } else
        setToast(
          result.error.code === 'STATE_CONFLICT'
            ? 'Versi sudah berubah. Muat ulang sebelum melanjutkan.'
            : `Gagal: ${result.error.safeMessage}`,
        );
    });
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Konten marketing"
        description="Kelola pengumuman global dan halaman publik yang tampil di home, harga, dan sekolah."
      />

      <section
        className="rounded-2xl border border-[#ddd4c8] bg-white p-4 sm:p-5"
        aria-labelledby="announcement-editor-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="announcement-editor-title" className="text-base font-semibold text-[#171717]">
              Pengumuman global
            </h2>
            <p className="mt-1 text-xs text-[#6d665d]">
              Banner ini tampil di atas seluruh halaman marketing. Perubahan langsung aktif setelah
              disimpan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6d665d]">Revisi {announcement?.revision ?? '-'}</span>
            <Button
              size="sm"
              variant="secondary"
              disabled={announcementLoading || announcementSaving}
              onClick={requestAnnouncement}
            >
              Muat ulang
            </Button>
          </div>
        </div>

        {announcementLoading ? (
          <div
            className="mt-4 h-36 animate-pulse rounded-xl bg-[#f3ede5]"
            aria-label="Memuat pengumuman"
          />
        ) : announcementDraft ? (
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-burgundy"
                checked={announcementDraft.enabled}
                onChange={(event) =>
                  setAnnouncementDraft((current) =>
                    current ? { ...current, enabled: event.target.checked } : current,
                  )
                }
              />
              Tampilkan pengumuman
            </label>

            <div className="grid gap-3 md:grid-cols-[0.45fr_1.55fr]">
              <label className="space-y-1.5 text-xs font-semibold text-[#6d665d]">
                Label
                <input
                  className="w-full rounded-xl border border-[#ddd4c8] bg-white px-3 py-2 text-sm font-normal text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#851925]/25"
                  maxLength={40}
                  value={announcementDraft.label}
                  onChange={(event) =>
                    setAnnouncementDraft((current) =>
                      current ? { ...current, label: event.target.value } : current,
                    )
                  }
                />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-[#6d665d]">
                Pesan
                <input
                  className="w-full rounded-xl border border-[#ddd4c8] bg-white px-3 py-2 text-sm font-normal text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#851925]/25"
                  maxLength={240}
                  value={announcementDraft.message}
                  onChange={(event) =>
                    setAnnouncementDraft((current) =>
                      current ? { ...current, message: event.target.value } : current,
                    )
                  }
                />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-[#6d665d]">
                Label CTA (opsional)
                <input
                  className="w-full rounded-xl border border-[#ddd4c8] bg-white px-3 py-2 text-sm font-normal text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#851925]/25"
                  maxLength={80}
                  value={announcementDraft.ctaLabel ?? ''}
                  onChange={(event) =>
                    setAnnouncementDraft((current) =>
                      current ? { ...current, ctaLabel: event.target.value || null } : current,
                    )
                  }
                />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-[#6d665d]">
                URL CTA (opsional)
                <input
                  className="w-full rounded-xl border border-[#ddd4c8] bg-white px-3 py-2 text-sm font-normal text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#851925]/25"
                  maxLength={500}
                  placeholder="/daftar atau https://..."
                  value={announcementDraft.ctaHref ?? ''}
                  onChange={(event) =>
                    setAnnouncementDraft((current) =>
                      current ? { ...current, ctaHref: event.target.value || null } : current,
                    )
                  }
                />
              </label>
            </div>

            <div className="rounded-xl border border-[#e2ddd6] bg-[#faf8f5] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8177]">
                Pratinjau
              </p>
              {announcementDraft.enabled ? (
                <div className="rounded-lg bg-[#851925] px-4 py-2.5 text-center text-sm text-white">
                  <strong>{announcementDraft.label || 'Label'}:</strong>{' '}
                  {announcementDraft.message || 'Pesan pengumuman'}{' '}
                  {announcementDraft.ctaLabel && announcementDraft.ctaHref ? (
                    <span className="font-semibold underline underline-offset-2">
                      {announcementDraft.ctaLabel}
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-[#6d665d]">
                  Pengumuman sedang dinonaktifkan dan tidak tampil ke publik.
                </p>
              )}
            </div>

            {announcementError ? (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {announcementError}
              </p>
            ) : null}

            <Button disabled={announcementSaving} onClick={saveAnnouncement}>
              {announcementSaving ? 'Menyimpan…' : 'Simpan pengumuman'}
            </Button>
          </div>
        ) : (
          <div
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {announcementError || 'Pengumuman tidak dapat dimuat.'}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Halaman marketing">
        {PAGES.map((item) => (
          <Button
            key={item.slug}
            size="sm"
            variant={selected === item.slug ? undefined : 'secondary'}
            onClick={() => {
              if (item.slug === selected) return;
              setLoading(true);
              setSelected(item.slug);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {loading ? (
        <AdminContentLoading />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#ddd4c8] bg-white p-3">
            <AdminPill tone={page?.summary.state === 'published' ? 'ok' : 'neutral'}>
              {page?.summary.state ?? 'draft'}
            </AdminPill>
            <span className="text-xs text-[#6d665d]">Revisi {page?.summary.revision ?? '—'}</span>
            <span className="text-xs text-[#6d665d]">
              Simpan draft dulu, lalu terbitkan setelah preview sesuai.
            </span>
            <a
              className="ml-auto text-xs font-semibold underline"
              href={PAGES.find((item) => item.slug === selected)?.href}
              target="_blank"
              rel="noreferrer"
            >
              Pratinjau publik
            </a>
            <Button size="sm" variant="secondary" disabled={saving} onClick={() => load()}>
              Muat ulang
            </Button>
            {page?.summary.state === 'published' ? (
              <Button
                size="sm"
                variant="secondary"
                disabled={saving}
                onClick={() => changePublication('unpublish')}
              >
                Tarik publikasi
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={saving || !page?.draft}
                onClick={() => changePublication('publish')}
              >
                Terbitkan
              </Button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <label className="block space-y-2" htmlFor="marketing-draft-json">
              <span className="text-sm font-semibold">Draft terstruktur (mode lanjutan)</span>
              <span className="block text-xs text-[#6d665d]">
                Gunakan hanya kalau mau edit schemaVersion, seo, dan blocks langsung. Untuk
                perubahan cepat, isi blok melalui editor yang lebih kecil nanti.
              </span>
              <textarea
                id="marketing-draft-json"
                className="min-h-[420px] w-full rounded-xl border border-[#ddd4c8] bg-white p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                value={draftJson}
                onChange={(event) => setDraftJson(event.target.value)}
                placeholder={
                  '{\n  "schemaVersion": 1,\n  "seo": { "title": "", "description": "" },\n  "blocks": []\n}'
                }
              />
            </label>

            <div className="space-y-3 rounded-xl border border-[#ddd4c8] bg-white p-4">
              <h3 className="text-sm font-semibold text-[#171717]">Panduan singkat</h3>
              <ul className="space-y-2 text-sm text-[#6d665d]">
                <li>• SEO mengubah judul, deskripsi, dan preview share publik.</li>
                <li>• Draft tidak tampil ke publik sampai diterbitkan.</li>
                <li>• Kalau JSON rusak, simpan diblokir sebelum data ditimpa.</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button disabled={saving || !draftJson.trim()} onClick={save}>
              {saving ? 'Menyimpan…' : 'Simpan draft'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
