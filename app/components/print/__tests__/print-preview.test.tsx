import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import A4PreviewFrame from '../A4PreviewFrame';
import OutputPackagePreview from '../OutputPackagePreview';

describe('F0-08 A4PreviewFrame — print preview foundation', () => {
  it('renders A4 page region with accessible label', () => {
    render(<A4PreviewFrame>content</A4PreviewFrame>);
    expect(
      screen.getByRole('region', { name: /pratinjau halaman a4/i }),
    ).toBeInTheDocument();
  });

  it('shows draft label by default', () => {
    render(<A4PreviewFrame>content</A4PreviewFrame>);
    expect(screen.getByTestId('draft-label')).toHaveTextContent(/pratinjau draft/i);
  });

  it('hides draft label when showDraftLabel=false', () => {
    render(<A4PreviewFrame showDraftLabel={false}>content</A4PreviewFrame>);
    expect(screen.queryByTestId('draft-label')).not.toBeInTheDocument();
  });

  it('applies A4 physical dimensions via CSS custom properties', () => {
    render(<A4PreviewFrame>content</A4PreviewFrame>);
    const page = screen.getByTestId('a4-page');
    // CSS vars are set as inline styles — verify the property names are applied
    expect(page).toHaveStyle({ width: 'var(--print-page-width)' });
    expect(page).toHaveStyle({ minHeight: 'var(--print-page-height)' });
    expect(page).toHaveStyle({ paddingTop: 'var(--print-margin-top)' });
    expect(page).toHaveStyle({ paddingRight: 'var(--print-margin-right)' });
    expect(page).toHaveStyle({ paddingBottom: 'var(--print-margin-bottom)' });
    expect(page).toHaveStyle({ paddingLeft: 'var(--print-margin-left)' });
  });

  it('renders children inside A4 frame', () => {
    render(<A4PreviewFrame><p>Soal nomor 1</p></A4PreviewFrame>);
    expect(screen.getByText('Soal nomor 1')).toBeInTheDocument();
  });
});

describe('F0-08 OutputPackagePreview — package order and student safety', () => {
  it('renders sections in canonical order (soal → jawaban → kunci → pembahasan)', () => {
    render(
      <OutputPackagePreview
        sections={['pembahasan', 'kunci-jawaban', 'lembar-soal', 'lembar-jawaban']}
        content={{}}
      />,
    );

    const sections = screen.getAllByTestId(/^section-/);
    const ids = sections.map((s) => s.getAttribute('data-testid'));
    expect(ids).toEqual([
      'section-lembar-soal',
      'section-lembar-jawaban',
      'section-kunci-jawaban',
      'section-pembahasan',
    ]);
  });

  it('excludes teacher-only sections in student share context', () => {
    render(
      <OutputPackagePreview
        sections={['lembar-soal', 'lembar-jawaban', 'kunci-jawaban', 'pembahasan']}
        content={{}}
        isStudentShareContext={true}
      />,
    );

    expect(screen.getByTestId('section-lembar-soal')).toBeInTheDocument();
    expect(screen.getByTestId('section-lembar-jawaban')).toBeInTheDocument();
    expect(screen.queryByTestId('section-kunci-jawaban')).not.toBeInTheDocument();
    expect(screen.queryByTestId('section-pembahasan')).not.toBeInTheDocument();
  });

  it('shows package manifest listing included sections', () => {
    render(
      <OutputPackagePreview
        sections={['lembar-soal', 'kunci-jawaban']}
        content={{}}
      />,
    );
    expect(screen.getByLabelText(/isi paket/i)).toHaveTextContent(/lembar soal siswa/i);
    expect(screen.getByLabelText(/isi paket/i)).toHaveTextContent(/kunci jawaban/i);
  });

  it('shows empty state when no sections provided', () => {
    render(<OutputPackagePreview sections={[]} content={{}} />);
    expect(screen.getByText(/tidak ada bagian/i)).toBeInTheDocument();
  });

  it('renders only one draft label (on first section)', () => {
    render(
      <OutputPackagePreview
        sections={['lembar-soal', 'lembar-jawaban', 'kunci-jawaban']}
        content={{}}
      />,
    );
    const labels = screen.getAllByTestId('draft-label');
    expect(labels).toHaveLength(1);
  });
});
