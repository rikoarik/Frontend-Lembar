import type { ReactNode } from 'react';
import MotionProviders from '../components/marketing/MotionProviders';
import Container from '../components/marketing/Container';
import AnnouncementBanner from '../components/marketing/AnnouncementBanner';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProviders>
      <AnnouncementBanner />
      <main id="main">
        {children}
      </main>
    </MotionProviders>
  );
}
