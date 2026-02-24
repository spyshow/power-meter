import { render, screen, waitFor } from '@testing-library/react';
import { PeakAnalysis } from './index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

// Mock EventSource
class MockEventSource {
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  close = vi.fn();
  constructor(public url: string) {}
}

describe('PeakAnalysis Page', () => {
  beforeEach(() => {
    vi.stubGlobal('EventSource', MockEventSource);
    vi.mocked(axios.get).mockResolvedValue({
      data: [
        { _time: '2026-02-24T10:00:00Z', device_id: '10', metric: 'voltage', value: 245.5 },
      ],
    });
  });

  it('renders title and table headers', async () => {
    render(<PeakAnalysis />);
    expect(screen.getByText(/Peak Value Analysis/i)).toBeInTheDocument();
    
    await waitFor(() => {
      // Use getAllByText because 'Device' and 'Peak Value' appear multiple times
      expect(screen.getAllByText(/Device/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Parameter/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Peak Value/i).length).toBeGreaterThan(0);
    });
  });

  it('renders data rows from API', async () => {
    render(<PeakAnalysis />);
    
    await waitFor(() => {
      expect(screen.getByText(/Device 1000/i)).toBeInTheDocument();
      expect(screen.getByText(/Voltage/i)).toBeInTheDocument();
      // Ant Design might break up the value and unit, use a function matcher
      expect(screen.getByText((content) => content.includes('245.5') && content.includes('V'))).toBeInTheDocument();
    });
  });
});
