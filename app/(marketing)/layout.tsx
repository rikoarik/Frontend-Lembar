import type { ReactNode } from 'react';
import MotionProviders from '../components/marketing/MotionProviders';

import AnnouncementBanner from '../components/marketing/AnnouncementBanner';
import MarketingNavbar from '../components/marketing/MarketingNavbar';
import MarketingFooter from '../components/marketing/MarketingFooter';
import SupportChat from '../components/marketing/SupportChat';
import LenisProvider from '../components/marketing/LenisProvider';
import { getMarketingSession } from '@/src/lib/api/marketingSession';

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const session = await getMarketingSession();
  return (
    <LenisProvider>
      <MotionProviders>
        <AnnouncementBanner />
        <MarketingNavbar session={session} />
        <main id="main">{children}</main>
        <MarketingFooter />
        <SupportChat />
      </MotionProviders>
    </LenisProvider>
  );
}
