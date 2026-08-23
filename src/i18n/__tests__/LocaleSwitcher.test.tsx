import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const state = vi.hoisted(() => ({
  locale: 'id',
  setLocale: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useLocale: () => state.locale,
  useTranslations: () => (key: string) =>
    ({ label: 'Bahasa', id: 'Indonesia', en: 'English' })[key] ?? key,
}));

vi.mock('../actions', () => ({ setLocale: state.setLocale }));

import { LocaleSwitcher } from '../LocaleSwitcher';

describe('LocaleSwitcher', () => {
  it('renders an accessible compact ID/EN segmented control', () => {
    render(<LocaleSwitcher />);

    expect(screen.getByRole('group', { name: 'Bahasa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Indonesia' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('persists a different locale but ignores the already active option', async () => {
    const user = userEvent.setup();
    state.setLocale.mockClear();
    state.locale = 'id';
    render(<LocaleSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Indonesia' }));
    expect(state.setLocale).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(state.setLocale).toHaveBeenCalledWith('en');
  });
});
