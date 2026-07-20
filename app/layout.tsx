import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/material-symbols/400.css';
import '@fontsource/material-symbols/600.css';
import '@fontsource/material-symbols/700.css';
import type { ReactNode } from 'react';
import './globals.css';
import LenisProvider from './components/marketing/LenisProvider';
import { QueryProvider } from './components/QueryProvider';

export const metadata = {
  title: 'lembar',
  description:
    'lembar — workspace asesmen untuk guru. Buat draft, tinjau, dan finalkan lembar soal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col font-body-default text-body-default bg-paper text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed"
      >
        <QueryProvider>
          <LenisProvider>{children}</LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
