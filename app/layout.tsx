import type { ReactNode } from 'react';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import LenisProvider from './components/marketing/LenisProvider';
import { QueryProvider } from './components/QueryProvider';

// Optimized font loading with next/font/google
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata = {
  title: 'lembar',
  description:
    'lembar — workspace asesmen untuk guru. Buat draft, tinjau, dan finalkan lembar soal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        {/* Material Symbols from Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
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
