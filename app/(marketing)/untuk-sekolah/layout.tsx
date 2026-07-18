import type { ReactNode } from 'react';
import type { Metadata } from 'next';

// Per-route metadata lives in a sibling server layout because the route's
// page.tsx is marked 'use client' and the App Router forbids exporting
// metadata from a client component. The page's JSX is unchanged.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Untuk sekolah — workspace asesmen terkelola',
  description:
    'Workspace organisasi lembar untuk sekolah: manajemen akun guru, bank soal internal, template bersama, dan audit trail. Program pilot untuk institusi pendidikan.',
  alternates: {
    canonical: '/untuk-sekolah',
  },
  openGraph: {
    title: 'Untuk sekolah — lembar',
    description:
      'Workspace organisasi untuk institusi sekolah: admin dasbor, kuota bersama, bank soal internal, dan audit trail.',
    url: '/untuk-sekolah',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Untuk sekolah — lembar',
    description: 'Workspace organisasi untuk institusi sekolah.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UntukSekolahLayout({ children }: { children: ReactNode }) {
  return children;
}
