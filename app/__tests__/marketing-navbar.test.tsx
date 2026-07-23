import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarketingNavbar from '@/app/components/marketing/MarketingNavbar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/app/components/marketing/Logo', () => ({
  default: () => <div data-testid="logo">logo</div>,
}));

vi.mock('@/app/components/marketing/ActiveNavIndicator', () => ({
  default: () => <span data-testid="active-indicator" />,
}));

describe('MarketingNavbar mobile menu', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('opens burger menu with section links and login on mobile', async () => {
    const user = userEvent.setup();
    render(<MarketingNavbar />);

    const toggle = screen.getByRole('button', { name: /buka menu navigasi/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: /navigasi seluler/i })).not.toBeInTheDocument();

    // Login should already be visible in the top bar (mobile + desktop)
    expect(screen.getAllByRole('link', { name: 'Masuk' }).length).toBeGreaterThan(0);

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const mobileNav = screen.getByRole('navigation', { name: /navigasi seluler/i });
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav).toHaveTextContent('Produk');
    expect(mobileNav).toHaveTextContent('Untuk Sekolah');
    expect(mobileNav).toHaveTextContent('Harga');
    expect(mobileNav).toHaveTextContent('Masuk');
    expect(mobileNav).toHaveTextContent('Coba Gratis');
  });

  it('closes mobile menu with Escape', async () => {
    const user = userEvent.setup();
    render(<MarketingNavbar />);

    await user.click(screen.getByRole('button', { name: /buka menu navigasi/i }));
    expect(screen.getByRole('navigation', { name: /navigasi seluler/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('navigation', { name: /navigasi seluler/i })).not.toBeInTheDocument();
  });
});
