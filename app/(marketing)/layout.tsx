import type { ReactNode } from 'react';
import MotionProviders from '../components/marketing/MotionProviders';
import Container from '../components/marketing/Container';
import AnnouncementBanner from '../components/marketing/AnnouncementBanner';
import MarketingNavbar from '../components/marketing/MarketingNavbar';
import MarketingFooter from '../components/marketing/MarketingFooter';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProviders>
      <AnnouncementBanner />
      <MarketingNavbar />
      <main id="main">{children}</main>
      <MarketingFooter />
    </MotionProviders>
  );
}
