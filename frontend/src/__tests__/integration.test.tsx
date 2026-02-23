import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

// Mock EventSource
class MockEventSource {
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  close = vi.fn();
  constructor(public url: string) {}
}

vi.stubGlobal('EventSource', MockEventSource);

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [
        { id: 10, name: 'Device 10' },
        { id: 20, name: 'Device 20' },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a grid of device cards after loading', async () => {
    render(<Dashboard />);

    // Wait for the devices to be loaded and rendered
    await waitFor(() => {
      expect(screen.getByText(/Device 10/i)).toBeInTheDocument();
      expect(screen.getByText(/Device 20/i)).toBeInTheDocument();
    });

    // Check for some default values (Stat renders 0 as "0.0")
    expect(screen.getAllByText(/0/i).length).toBeGreaterThan(0);
  });
});
