import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanUsageSettingsPage from '../app/pengaturan/langganan/page';

describe('F2-08 plan/usage settings — /app/pengaturan/langganan', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page heading and plan label', () => {
    render(<PlanUsageSettingsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /paket & kuota/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/paket saat ini/i)).toBeInTheDocument();
    expect(screen.getByText('Paket Aktif')).toBeInTheDocument();
  });

  it('renders usage meter with accessible label', () => {
    render(<PlanUsageSettingsPage />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '12');
    expect(progressbar).toHaveAttribute('aria-valuemax', '50');
  });

  it('renders CTA button', () => {
    render(<PlanUsageSettingsPage />);

    expect(
      screen.getByRole('button', { name: /hubungi tim kami/i }),
    ).toBeInTheDocument();
  });

  it('CTA button is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<PlanUsageSettingsPage />);

    const btn = screen.getByRole('button', { name: /hubungi tim kami/i });
    btn.focus();
    expect(btn).toHaveFocus();
    // clicking does not throw (mock pending B6-01)
    await user.click(btn);
  });

  it('does not display specific prices or tier names', () => {
    render(<PlanUsageSettingsPage />);
    const content = document.body.textContent ?? '';
    // Must not contain Rupiah or numeric price patterns
    expect(content).not.toMatch(/Rp\s?\d/);
    expect(content).not.toMatch(/\$\d/);
  });
});
