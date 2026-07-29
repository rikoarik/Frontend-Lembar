import type { ReactNode } from 'react';
import MotionProviders from '../components/marketing/MotionProviders';
import Container from '../components/marketing/Container';
import AnnouncementBanner from '../components/marketing/AnnouncementBanner';
import MarketingNavbar from '../components/marketing/MarketingNavbar';
import MarketingFooter from '../components/marketing/MarketingFooter';
import SupportChat from '../components/marketing/SupportChat';
import { getMarketingSession } from '@/src/lib/api/marketingSession';

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const session = await getMarketingSession();
  return (
    <MotionProviders>
      <AnnouncementBanner />
      <MarketingNavbar session={session} />
      <main id="main">{children}</main>
      <MarketingFooter />
      <SupportChat />
    </MotionProviders>
  );
}
