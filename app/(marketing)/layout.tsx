import type { ReactNode } from 'react';
import MarketingNavbar from '../components/marketing/MarketingNavbar';
import MarketingFooter from '../components/marketing/MarketingFooter';
import MotionProviders from '../components/marketing/MotionProviders';
import Container from '../components/marketing/Container';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProviders>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <MarketingNavbar />
      <main id="main">
        <Container className="marketing-page">{children}</Container>
      </main>
      <MarketingFooter />
    </MotionProviders>
  );
}
