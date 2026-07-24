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
      <head>
        {/* Preconnect untuk Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Fonts - Inter, Manrope, Material Symbols (async load) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
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
