'use client';

import { useState } from 'react';

type GoogleAuthButtonProps = {
  intent: 'masuk' | 'daftar';
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M21.8 12.2c0-.7-.1-1.5-.2-2.2H12v4.1h5.5a4.7 4.7 0 0 1-2 3.1v2.7h3.3c1.9-1.8 3-4.4 3-7.7Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.8-2.4l-3.3-2.7c-.9.6-2.1 1-3.5 1a6 6 0 0 1-5.6-4.1H3v2.8A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC04"
        d="M6.4 13.8a6 6 0 0 1 0-3.7V7.4H3a10 10 0 0 0 0 9.2l3.4-2.8Z"
      />
      <path
        fill="#EA4335"
        d="M12 6a5.4 5.4 0 0 1 3.9 1.5l2.9-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.4l3.4 2.7A6 6 0 0 1 12 6Z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({ intent }: GoogleAuthButtonProps) {
  const [message, setMessage] = useState<string>();
  const label = intent === 'masuk' ? 'Masuk dengan Google' : 'Daftar dengan Google';

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() =>
          setMessage('Google akan aktif setelah backend autentikasi tersedia.')
        }
        aria-describedby={message ? `google-${intent}-status` : undefined}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border-subtle bg-paper px-4 font-label-semibold text-label-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30 active:bg-surface-container"
      >
        <GoogleMark />
        {label}
      </button>
      {message ? (
        <p
          id={`google-${intent}-status`}
          role="status"
          className="font-body-sm text-body-sm text-secondary"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
