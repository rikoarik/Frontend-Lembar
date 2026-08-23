import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
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
  metadataBase: new URL('https://app.lembar.web.id'),
  title: {
    default: 'lembar',
    template: '%s · lembar',
  },
  description:
    'lembar — workspace asesmen untuk guru. Buat draft, tinjau, dan finalkan lembar soal.',
  openGraph: {
    title: 'lembar',
    description:
      'Workspace asesmen untuk guru. Buat draft, tinjau, dan finalkan lembar soal.',
    url: 'https://app.lembar.web.id',
    siteName: 'lembar',
    images: [
      {
        url: '/og/lembar-home',
        width: 1200,
        height: 630,
        alt: 'lembar — workspace asesmen untuk guru',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'lembar',
    description:
      'Workspace asesmen untuk guru. Buat draft, tinjau, dan finalkan lembar soal.',
    images: ['/og/lembar-home.jpg'],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload Material Symbols font for instant icon render */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/materialsymbolsoutlined/v192/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Material Symbols stylesheet */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col font-body-default text-body-default bg-paper text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed"
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <LenisProvider>{children}</LenisProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
