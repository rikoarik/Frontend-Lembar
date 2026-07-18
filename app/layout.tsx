import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'lembar',
  description:
    'lembar — workspace asesmen untuk guru. Buat draft, tinjau, dan finalkan lembar soal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
