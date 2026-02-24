import { renderHook, act, waitFor } from '@testing-library/react';
import { usePeaksData } from './usePeaksData';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

// Create a global mock for EventSource
let mockEventSourceInstance: MockEventSource;

class MockEventSource {
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  close = vi.fn();
  constructor(public url: string) {
    mockEventSourceInstance = this;
  }
}

describe('usePeaksData', () => {
  beforeEach(() => {
    vi.stubGlobal('EventSource', MockEventSource);
    vi.mocked(axios.get).mockResolvedValue({
      data: [{ _time: '2026-02-24T10:00:00Z', device_id: '10', metric: 'voltage', value: 240 }],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('fetches initial peaks', async () => {
    const { result } = renderHook(() => usePeaksData());
    
    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].value).toBe(240);
    });
  });

  it('updates state when a peak event arrives', async () => {
    const { result } = renderHook(() => usePeaksData());
    
    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });

    act(() => {
      mockEventSourceInstance.onmessage!({
        data: JSON.stringify({ 
          type: 'peak', 
          id: 20, 
          metric: 'current', 
          value: 15, 
          timestamp: '2026-02-24T11:00:00Z' 
        }),
      } as MessageEvent);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].device_id).toBe('20');
    expect(result.current.data[0].value).toBe(15);
  });
});
