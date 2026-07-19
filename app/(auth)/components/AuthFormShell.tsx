'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthFormShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  foot: ReactNode;
};

export default function AuthFormShell({
  eyebrow,
  title,
  description,
  children,
  foot,
}: AuthFormShellProps) {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen w-full max-w-reading-max flex-col gap-6 px-margin-mobile py-unit-8 md:px-10 md:py-unit-12"
    >
      <Link
        href="/"
        className="font-caption text-caption font-medium text-secondary hover:text-burgundy"
      >
        ← kembali ke beranda
      </Link>
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          {eyebrow ? (
            <span className="font-label-semibold text-label-semibold text-secondary">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-h2 text-h2 text-ink">{title}</h1>
          {description ? (
            <p className="font-body-default text-body-default text-secondary">{description}</p>
          ) : null}
        </div>
        {children}
      </section>
      <div className="mt-auto flex flex-col gap-2 text-center font-body-sm text-body-sm text-secondary">
        {foot}
      </div>
    </main>
  );
}
