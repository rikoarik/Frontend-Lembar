'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Produk' },
  { href: '/untuk-sekolah', label: 'Untuk Sekolah' },
  { href: '/harga', label: 'Harga' },
];

export default function SubPageNavbar() {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border-subtle">
      <div className="flex justify-between items-center h-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <Link href="/" className="flex items-center" aria-label="lembar beranda">
          <img alt="lembar logo" className="h-unit-8 w-unit-8 object-contain" src="/lembar/logo-mark.png" />
        </Link>

        <div className="hidden md:flex items-center gap-unit-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className={`font-body-default transition-colors duration-200 ${
                pathname === link.href
                  ? 'text-burgundy font-bold border-b-2 border-burgundy pb-1'
                  : 'text-secondary hover:text-burgundy'
              }`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-unit-4">
          <Link className="text-secondary font-label-semibold px-unit-4 py-unit-2 hover:text-burgundy transition-colors" href="/masuk">Masuk</Link>
          <Link className="bg-burgundy text-on-primary font-label-semibold h-[44px] px-unit-6 rounded-lg hover:brightness-110 transition-all flex items-center" href="/daftar">Coba Gratis</Link>
        </div>
      </div>
    </nav>
  );
}
