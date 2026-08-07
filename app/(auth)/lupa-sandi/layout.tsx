import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi — lembar',
  description: 'Pulihkan akses akun lembar Anda.',
};

export default function LupaSandiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
