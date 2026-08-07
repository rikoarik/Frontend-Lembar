import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Atur Ulang Kata Sandi — lembar',
  description: 'Buat kata sandi baru untuk akun lembar Anda.',
};

export default function ResetSandiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
