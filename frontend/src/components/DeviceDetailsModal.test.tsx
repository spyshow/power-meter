import { render, screen, waitFor } from '@testing-library/react';
import { DeviceDetailsModal } from './DeviceDetailsModal';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

// Mock @ant-design/plots (it uses canvas which is hard to test in jsdom)
vi.mock('@ant-design/plots', () => ({
  Line: () => <div data-testid="mock-line-chart" />,
}));

describe('DeviceDetailsModal', () => {
  const device = { id: 10, name: 'Device 10' };

  beforeEach(() => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [
        { _time: '2026-02-23T06:00:00Z', voltage: 230, current: 5, kva: 1.15 },
        { _time: '2026-02-23T06:01:00Z', voltage: 231, current: 5.1, kva: 1.18 },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and loading state', async () => {
    render(<DeviceDetailsModal device={device} open={true} onClose={() => {}} />);
    expect(screen.getByText(/Device 10 Telemetry Trends/i)).toBeInTheDocument();
  });

  it('fetches and displays historical charts', async () => {
    render(<DeviceDetailsModal device={device} open={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/history?deviceId=10'));
      expect(screen.getAllByTestId('mock-line-chart').length).toBeGreaterThan(0);
    });
  });
});
