import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPanelProvider, useAdminSectionState } from '@/src/features/admin/adminPanelState';

function Probe() {
  const a = useAdminSectionState('guru');
  const b = useAdminSectionState('accounts');
  return (
    <div>
      <div data-testid="guru-search">{a.search}</div>
      <div data-testid="accounts-search">{b.search}</div>
      <button type="button" onClick={() => a.setSearch('Rina')}>
        set-guru
      </button>
      <button type="button" onClick={() => b.setSearch('ops')}>
        set-accounts
      </button>
    </div>
  );
}

describe('admin panel state', () => {
  it('stores section search independently', async () => {
    const user = userEvent.setup();
    render(
      <AdminPanelProvider panelId="school">
        <Probe />
      </AdminPanelProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'set-guru' }));
    await user.click(screen.getByRole('button', { name: 'set-accounts' }));

    expect(screen.getByTestId('guru-search')).toHaveTextContent('Rina');
    expect(screen.getByTestId('accounts-search')).toHaveTextContent('ops');
  });
});
