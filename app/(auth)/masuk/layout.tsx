import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Masuk — lembar',
  description: 'Masuk ke akun lembar Anda untuk mulai membuat asesmen.',
};

export default function MasukLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
