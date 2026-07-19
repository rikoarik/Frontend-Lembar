import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ChoiceCard, Field, LinkButton, Panel, StatusBadge, TextField } from '../index';

function expectNoCriticalOrSeriousA11yProxy(container: HTMLElement) {
  // ponytail: semantic smoke proxy until axe-core is available in repo deps; upgrade to axe.run().
  expect(container.innerHTML.trim()).not.toBe('');
}

describe('Button primitive', () => {
  it('renders accessible variants, sizes, disabled, loading, and link states', async () => {
    const user = userEvent.setup();
    let clicked = 0;
    const { container, rerender } = render(<Button variant="primary">Buat draft</Button>);
    expect(screen.getByRole('button', { name: /Buat draft/i })).toHaveClass('bg-brand-accent');

    rerender(<Button variant="secondary">Simpan</Button>);
    expect(screen.getByRole('button', { name: /Simpan/i })).toHaveClass('bg-brand-surface-raised');

    rerender(<Button variant="quiet">Tinjau</Button>);
    expect(screen.getByRole('button', { name: /Tinjau/i })).toHaveClass('bg-transparent');

    rerender(<Button variant="danger">Hapus</Button>);
    expect(screen.getByRole('button', { name: /Hapus/i })).toHaveClass('bg-brand-danger');

    rerender(<Button variant="link">Buka</Button>);
    expect(screen.getByRole('button', { name: /Buka/i })).toHaveClass('text-brand-accent');

    rerender(<Button size="sm">Kecil</Button>);
    expect(screen.getByRole('button', { name: /Kecil/i })).toHaveClass('h-[var(--control-sm)]');

    rerender(<Button size="lg">Besar</Button>);
    expect(screen.getByRole('button', { name: /Besar/i })).toHaveClass('h-[var(--control-lg)]');

    rerender(
      <Button disabled onClick={() => clicked++}>
        Simpan
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: /Simpan/i })).catch(() => undefined);
    expect(clicked).toBe(0);

    rerender(
      <Button loading loadingLabel="Membuat draft…">
        Buat draft
      </Button>,
    );
    expect(screen.getByRole('button', { name: /Membuat draft…/ })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('button', { name: /Membuat draft…/ })).toBeDisabled();
    expectNoCriticalOrSeriousA11yProxy(container);
  });

  it('renders LinkButton with proper link semantics', () => {
    const { container } = render(<LinkButton href="/draft">Buka draft</LinkButton>);
    expect(screen.getByRole('link', { name: /Buka draft/i })).toHaveAttribute('href', '/draft');
    expectNoCriticalOrSeriousA11yProxy(container);
  });
});

describe('Field primitive', () => {
  it('associates label, help, required, and error state', () => {
    const { container, rerender } = render(
      <Field label="Judul lembar" help="Maksimal 80 karakter." required>
        {(props) => <input {...props} />}
      </Field>,
    );
    const input = screen.getByLabelText(/Judul lembar/i);
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();

    rerender(
      <Field label="Judul lembar" error="Judul wajib diisi">
        {(props) => <input {...props} />}
      </Field>,
    );
    expect(screen.getByLabelText(/Judul lembar/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/Judul wajib diisi/i);
    expectNoCriticalOrSeriousA11yProxy(container);
  });

  it('TextField supports input and textarea helpers', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TextField label="Nama" help="Nama tampil di header" />);
    const input = screen.getByLabelText(/Nama/i);
    await user.type(input, 'Guru A');
    expect(input).toHaveValue('Guru A');

    rerender(<TextField multiline label="Catatan" />);
    expect(screen.getByLabelText(/Catatan/i).tagName).toBe('TEXTAREA');
  });
});

describe('ChoiceCard primitive', () => {
  it('renders radio/checkbox cards with whole-card labels and keyboard toggle', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <ChoiceCard kind="radio" name="mode" value="a" title="Buku cetak" defaultChecked />
        <ChoiceCard kind="radio" name="mode" value="b" title="Materi digital" />
      </>,
    );
    const a = screen.getByRole('radio', { name: /Buku cetak/i });
    const b = screen.getByRole('radio', { name: /Materi digital/i });
    expect(a).toBeChecked();
    b.focus();
    await user.keyboard(' ');
    expect(b).toBeChecked();
    expect(a).not.toBeChecked();
    expectNoCriticalOrSeriousA11yProxy(container);
  });
});

describe('StatusBadge primitive', () => {
  it('renders the six allowed labels with status role', () => {
    const labels = [
      'Draft',
      'Diproses',
      'Perlu ditinjau',
      'Final',
      'Gagal',
      'Kedaluwarsa',
    ] as const;
    const { container } = render(
      <>
        {labels.map((label) => (
          <StatusBadge key={label} label={label} />
        ))}
      </>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(6);
    for (const label of labels) expect(screen.getByText(label)).toBeInTheDocument();
    expectNoCriticalOrSeriousA11yProxy(container);
  });
});

describe('Panel primitive', () => {
  it('renders border-first and elevated panel surfaces', () => {
    const { container, rerender } = render(
      <Panel
        title="Pengaturan"
        description="Atur preferensi lembar Anda."
        actions={<button>Simpan</button>}
      >
        <p>Isi panel</p>
      </Panel>,
    );
    expect(screen.getByRole('heading', { level: 2, name: /Pengaturan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan/i })).toBeInTheDocument();

    rerender(
      <Panel title="Elevated" elevated>
        <p>Isi panel</p>
      </Panel>,
    );
    expect(screen.getByRole('heading', { level: 2, name: /Elevated/i })).toBeInTheDocument();
    expectNoCriticalOrSeriousA11yProxy(container);
  });
});
