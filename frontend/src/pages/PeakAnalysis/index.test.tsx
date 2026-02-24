import { render, screen } from '@testing-library/react';
import { PeakAnalysis } from './index';
import { describe, it, expect } from 'vitest';

describe('PeakAnalysis Page', () => {
  it('renders title and description', () => {
    render(<PeakAnalysis />);
    expect(screen.getByText(/Peak Value Analysis/i)).toBeInTheDocument();
  });
});
