import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { marketingMetadata } from '@/src/lib/marketing/marketingMetadata';

// Per-route metadata lives in a sibling server layout because the route's
// page.tsx is marked 'use client' and the App Router forbids exporting
// metadata from a client component. The page's JSX is unchanged.
export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata('untuk-sekolah', {
    title: 'Untuk sekolah — workspace asesmen terkelola',
    description:
      'Workspace organisasi lembar untuk sekolah: manajemen akun guru, bank soal internal, template bersama, dan audit trail. Program pilot untuk institusi pendidikan.',
    canonical: '/untuk-sekolah',
  });
}

export default function UntukSekolahLayout({ children }: { children: ReactNode }) {
  return children;
}
