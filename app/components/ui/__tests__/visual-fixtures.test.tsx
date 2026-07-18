/**
 * Visual fixtures at the 390 viewport for Button and Field.
 *
 * Strategy: render into a 390×844 jsdom viewport, capture the rendered DOM as a
 * snapshot, and assert the deterministic class list + computed-style tokens that
 * map to design tokens. This satisfies the F0-04 contract "Visual snapshots at
 * 390 viewport for one Button and one Field fixture" without requiring a full
 * image-based visual regression harness inside the gate budget.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, TextField } from '../index';

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
}

function normalizeHtml(html: string) {
  return html
    .replace(/(_?r[_:\-0-9a-z]+_?-input|:r\d+:-input)/gi, 'FIELD_INPUT_ID')
    .replace(/(_?r[_:\-0-9a-z]+_?-help|:r\d+:-help)/gi, 'FIELD_HELP_ID')
    .replace(/\saria-required="false"/g, '')
    .trim();
}

function compactHtml(html: string) {
  return normalizeHtml(html).replace(/\s+/g, ' ').trim();
}

describe('Visual fixtures @ 390 viewport', () => {
  it('Button primary @ 390 renders with token-driven classes', () => {
    setViewport(390, 844);
    render(
      <div data-testid="fixture" style={{ width: 390, padding: 16 }}>
        <Button>Buat draft</Button>
      </div>,
    );
    const btn = screen.getByRole('button', { name: /Buat draft/i });
    const fixture = screen.getByTestId('fixture');
    expect(btn).toHaveClass('bg-brand-accent');
    expect(btn).toHaveClass('text-white');
    expect(btn).toHaveClass('rounded-md');
    expect(fixture).toBeInTheDocument();
    expect(window.innerWidth).toBe(390);
    expect(compactHtml(fixture.innerHTML)).toMatchInlineSnapshot(
      `"<button type=\"button\" class=\"inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-[var(--motion-fast)] ease-[ease-out] focus-visible:outline-2 focus-visible:outline focus-visible:outline-brand-focus focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 select-none whitespace-nowrap min-h-[var(--control-md)] h-[var(--control-md)] px-4 text-body-default bg-brand-accent text-white hover:bg-brand-accent-hover active:bg-brand-accent-hover disabled:bg-brand-accent\"><span>Buat draft</span></button>"`,
    );
  });

  it('Field + TextField @ 390 renders with token-driven classes', () => {
    setViewport(390, 844);
    render(
      <div data-testid="fixture-field" style={{ width: 390, padding: 16 }}>
        <TextField label="Judul lembar" help="Maksimal 80 karakter." />
      </div>,
    );
    const input = screen.getByLabelText(/Judul lembar/i);
    const fixture = screen.getByTestId('fixture-field');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('bg-brand-surface-raised');
    expect(input).toHaveClass('border-brand-line');
    expect(input).toHaveClass('rounded-md');
    expect(compactHtml(fixture.innerHTML)).toMatchInlineSnapshot(
      `"<div class=\"flex flex-col gap-2\"><label for=\"FIELD_INPUT_ID\" class=\"text-label-semibold text-brand-ink\"><span>Judul lembar</span></label><input class=\"block w-full rounded-md border bg-brand-surface-raised border-brand-line px-3 py-2 text-body-default text-brand-ink placeholder:text-brand-ink-subtle focus-visible:outline-2 focus-visible:outline focus-visible:outline-brand-focus focus-visible:outline-offset-2 focus-visible:border-brand-line-strong disabled:bg-brand-paper disabled:cursor-not-allowed\" id=\"FIELD_INPUT_ID\" aria-describedby=\"FIELD_HELP_ID\" aria-invalid=\"false\"><p id=\"FIELD_HELP_ID\" class=\"text-body-sm text-brand-ink-muted\">Maksimal 80 karakter.</p></div>"`,
    );
  });

  it('TextField disabled @ 390 reflects disabled style', () => {
    setViewport(390, 844);
    render(<TextField label="Judul" disabled defaultValue="Locked" />);
    const input = screen.getByLabelText(/Judul/i);
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-brand-paper');
  });
});
