'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('announcement_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('announcement_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-burgundy text-white px-4 py-2 relative flex items-center justify-center">
      <div className="flex items-center gap-2 pr-8 text-sm font-body-sm">
        <span className="material-symbols-outlined text-[16px]">campaign</span>
        <span>
          <strong>Pengumuman:</strong> Selamat datang di lembar! Uji coba gratis kini tersedia untuk
          institusi pendidikan.
        </span>
      </div>
      <button
        onClick={handleClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
        aria-label="Tutup pengumuman"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
