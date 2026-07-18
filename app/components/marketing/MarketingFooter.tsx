import { marketingFooter } from '@/src/lib/marketing/footer';
import Logo from './Logo';

export default function MarketingFooter() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="footer__inner page">
        <div className="footer__brand-block">
          <Logo variant="mark" className="footer__wordmark" alt={marketingFooter.brand} />
          <span className="footer__brand-text">{marketingFooter.brand}</span>
          <p className="footer__tagline">
            {marketingFooter.tagline} {marketingFooter.copyright}
          </p>
        </div>
        <nav className="footer__links" aria-label="Footer links">
          {marketingFooter.links.map((link) => (
            <a key={link.id} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
