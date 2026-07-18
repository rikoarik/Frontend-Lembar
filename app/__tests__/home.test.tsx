import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('home shell', () => {
  it('renders the lowercase "lembar" wordmark and Indonesian placeholder copy', () => {
    render(<Home />);
    const brand = screen.getByText(/^lembar$/);
    expect(brand).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /lembar/i })).toBeInTheDocument();
  });
});
