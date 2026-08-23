import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrintPageWrapper } from '@/src/features/output/PrintPageWrapper';

function makeChildren(n: number) {
  return Array.from({ length: n }, (_, i) => <div key={i} data-question={i + 1} />);
}

describe('PrintPageWrapper', () => {
  it('renders without crash with 0 questions', () => {
    const { container } = render(
      <PrintPageWrapper questionsPerPage={20}>{makeChildren(0)}</PrintPageWrapper>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('renders without crash with 1 question', () => {
    const { container } = render(
      <PrintPageWrapper questionsPerPage={20}>{makeChildren(1)}</PrintPageWrapper>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('renders without crash with exactly 20 questions', () => {
    const { container } = render(
      <PrintPageWrapper questionsPerPage={20}>{makeChildren(20)}</PrintPageWrapper>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('renders without crash with 21 questions', () => {
    const { container } = render(
      <PrintPageWrapper questionsPerPage={20}>{makeChildren(21)}</PrintPageWrapper>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('defaults questionsPerPage to 20', () => {
    // 21 children → 2 pages when default 20 is used
    const { container } = render(<PrintPageWrapper>{makeChildren(21)}</PrintPageWrapper>);
    // wrapper div contains page divs
    const pages = container.querySelectorAll('[data-page]');
    expect(pages).toHaveLength(2);
  });

  it('splits children into pages of questionsPerPage size', () => {
    // 21 children, 10 per page → 3 pages
    const { container } = render(
      <PrintPageWrapper questionsPerPage={10}>{makeChildren(21)}</PrintPageWrapper>,
    );
    const pages = container.querySelectorAll('[data-page]');
    expect(pages).toHaveLength(3);
  });

  it('each page carries the print-page class', () => {
    const { container } = render(
      <PrintPageWrapper questionsPerPage={20}>{makeChildren(1)}</PrintPageWrapper>,
    );
    const page = container.querySelector('[data-page]');
    expect(page).toHaveClass('print-page');
  });

  it('0 questions renders 1 empty page', () => {
    const { container } = render(
      <PrintPageWrapper questionsPerPage={20}>{makeChildren(0)}</PrintPageWrapper>,
    );
    const pages = container.querySelectorAll('[data-page]');
    expect(pages).toHaveLength(1);
  });
});
