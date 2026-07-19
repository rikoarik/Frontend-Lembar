import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivasiPage, { metadata as privasiMetadata } from '../(marketing)/privasi/page';
import SyaratPage, { metadata as syaratMetadata } from '../(marketing)/syarat/page';

describe('canonical legal pages — F1-08', () => {
  it('/privasi renders Kebijakan Privasi h1 title', () => {
    render(<PrivasiPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /kebijakan privasi/i }),
    ).toBeInTheDocument();
  });

  it('/syarat renders Syarat & Ketentuan h1 title', () => {
    render(<SyaratPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /syarat & ketentuan/i }),
    ).toBeInTheDocument();
  });

  it('PrivasiPage exports correct metadata', () => {
    expect(privasiMetadata).toBeDefined();
    expect(privasiMetadata.title).toContain('Kebijakan Privasi - lembar');
    expect(privasiMetadata.description).toContain('privasi lembar');
  });

  it('SyaratPage exports correct metadata', () => {
    expect(syaratMetadata).toBeDefined();
    expect(syaratMetadata.title).toContain('Syarat & Ketentuan - lembar');
    expect(syaratMetadata.description).toContain('platform lembar');
  });
});
