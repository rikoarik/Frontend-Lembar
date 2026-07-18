import type { ReactNode } from 'react';
import SubPageNavbar from './SubPageNavbar';
import Link from 'next/link';

interface MarketingSubPageLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: string;
  updateDate?: string;
  asymmetric?: boolean;
  children: ReactNode;
}

export default function MarketingSubPageLayout({
  title,
  description,
  badge,
  updateDate,
  asymmetric = false,
  children,
}: MarketingSubPageLayoutProps) {
  return (
    <>
      <SubPageNavbar />
      <main>
        {/* Reusable Hero Section */}
        <section className="pt-unit-6 pb-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <Link href="/" className="inline-flex items-center gap-1.5 text-secondary hover:text-burgundy text-caption transition-colors mb-unit-8 group">
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              Beranda
            </Link>

            {asymmetric ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-8 items-end">
                <div className="lg:col-span-7">
                  {badge && (
                    <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20 inline-block mb-unit-4">
                      {badge}
                    </span>
                  )}
                  <h1 className="font-display-xl-mobile md:font-display-xl text-ink leading-[1.1] mb-unit-6">
                    {title}
                  </h1>
                </div>
                {description && (
                  <div className="lg:col-span-5">
                    <div className="text-secondary text-body-lead leading-relaxed border-l-2 border-burgundy pl-unit-6">
                      {description}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-2xl">
                {badge && (
                  <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20 inline-block mb-unit-4">
                    {badge}
                  </span>
                )}
                <h1 className="font-display-xl-mobile md:font-display-xl text-ink leading-[1.1] mb-unit-4">
                  {title}
                </h1>
                {description && (
                  <p className="text-secondary text-body-lead leading-relaxed mt-unit-2">
                    {description}
                  </p>
                )}
                {updateDate && (
                  <p className="text-secondary text-body-sm mt-unit-2">
                    {updateDate}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Page Content */}
        {children}
      </main>
    </>
  );
}
