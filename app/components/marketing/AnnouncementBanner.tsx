'use client';

import { useEffect, useState } from 'react';

type Announcement = {
  enabled: boolean;
  label: string;
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  revision: number;
};

const FALLBACK: Announcement = {
  enabled: true,
  label: 'Beta',
  message: 'Lembar sedang dalam tahap beta dan terus disempurnakan bersama guru Indonesia.',
  ctaLabel: 'Mulai mencoba',
  ctaHref: '/daftar',
  revision: 1,
};

const DISMISSED_KEY = 'lembar.announcement.dismissed-revision';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement>(FALLBACK);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const apply = (next: Announcement) => {
      if (!active) return;
      setAnnouncement(next);
      const dismissedRevision = window.localStorage.getItem(DISMISSED_KEY);
      setIsVisible(next.enabled && dismissedRevision !== String(next.revision));
    };

    void fetch('/v1/public/announcement')
      .then(async (response) => {
        if (!response.ok) return FALLBACK;
        const payload = (await response.json()) as { data?: Partial<Announcement> };
        const data = payload.data;
        if (
          !data ||
          typeof data.enabled !== 'boolean' ||
          typeof data.label !== 'string' ||
          typeof data.message !== 'string' ||
          typeof data.revision !== 'number'
        ) {
          return FALLBACK;
        }
        return {
          enabled: data.enabled,
          label: data.label,
          message: data.message,
          ctaLabel: typeof data.ctaLabel === 'string' ? data.ctaLabel : null,
          ctaHref: typeof data.ctaHref === 'string' ? data.ctaHref : null,
          revision: data.revision,
        } satisfies Announcement;
      })
      .then(apply)
      .catch(() => apply(FALLBACK));

    return () => {
      active = false;
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    window.localStorage.setItem(DISMISSED_KEY, String(announcement.revision));
  };

  if (!isVisible) return null;

  return (
    <aside
      className="relative flex items-center justify-center bg-burgundy px-4 py-2.5 text-white"
      aria-label="Pengumuman"
    >
      <div className="flex items-center gap-2 pr-10 text-center text-sm leading-5">
        <span className="material-symbols-outlined hidden text-[17px] sm:inline" aria-hidden="true">
          campaign
        </span>
        <span>
          <strong>{announcement.label}:</strong> {announcement.message}{' '}
          {announcement.ctaLabel && announcement.ctaHref ? (
            <a
              href={announcement.ctaHref}
              className="whitespace-nowrap font-semibold underline underline-offset-2 hover:opacity-80"
            >
              {announcement.ctaLabel}
            </a>
          ) : null}
        </span>
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Tutup pengumuman"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          close
        </span>
      </button>
    </aside>
  );
}
