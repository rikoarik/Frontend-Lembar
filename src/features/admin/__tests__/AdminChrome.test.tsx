import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AdminConfirmModal, AdminFilterChip } from '../AdminChrome';

vi.mock('next/navigation', () => ({
  usePathname: () => '/school',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('admin accessibility basics', () => {
  it('exposes filter selection with aria-pressed', () => {
    render(<AdminFilterChip active>Aktif</AdminFilterChip>);
    expect(screen.getByRole('button', { name: 'Aktif' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('focuses the modal cancel action and closes on Escape', async () => {
    const onCancel = vi.fn();
    render(
      <AdminConfirmModal
        open
        description="Konfirmasi"
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Batal' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
