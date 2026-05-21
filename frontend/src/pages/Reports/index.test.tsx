import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Reports } from './index';
import { TestWrapper } from '../../test/setup';
import * as core from '@refinedev/core';

// Mock Refine hooks
vi.mock('@refinedev/core', async () => {
  const actual = await vi.importActual('@refinedev/core');
  return {
    ...actual,
    useApiUrl: () => 'http://localhost:3001/api',
    useCustomMutation: vi.fn(),
  };
});

describe('Reports Page', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (core.useCustomMutation as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    });
  });

  it('renders correctly with initial values', () => {
    render(<Reports />, { wrapper: TestWrapper });
    expect(screen.getByText('Report Generation')).toBeInTheDocument();
    expect(screen.getByText('Preview Data')).toBeInTheDocument();
  });

  it('handles preview data successfully', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      data: [
        { device_id: 10, timestamp: '2026-05-21T10:00:00Z', apparentPower: 1.5 }
      ]
    });

    render(<Reports />, { wrapper: TestWrapper });

    const previewButton = screen.getByText('Preview Data');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(screen.getByText('Data Preview (First 100 rows)')).toBeInTheDocument();
      expect(screen.getByText('APPARENTPOWER')).toBeInTheDocument();
    });
  });

  it('shows empty state when no data is returned', async () => {
    mockMutateAsync.mockResolvedValueOnce({ data: [] });

    render(<Reports />, { wrapper: TestWrapper });

    const previewButton = screen.getByText('Preview Data');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('No data to display. Select criteria and click \'Preview Data\'.')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Network Error'));

    render(<Reports />, { wrapper: TestWrapper });

    const previewButton = screen.getByText('Preview Data');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      // Ensure button is no longer in loading state (checked by enabled/disabled or other means)
      expect(previewButton).not.toHaveAttribute('disabled');
    });
  });
});
