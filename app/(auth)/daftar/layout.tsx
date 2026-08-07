import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Buat Akun — lembar',
  description: 'Daftar gratis dan buat asesmen AI pertama Anda dalam 2 menit.',
};

export default function DaftarLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
