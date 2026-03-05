import { renderHook, act } from '@testing-library/react';
import { useRealTimeData } from './useRealTimeData';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

describe('useRealTimeData', () => {
  const initialDevices = [{ id: 10, name: 'Device 10' }];

  beforeEach(() => {
    vi.stubGlobal('EventSource', MockEventSource);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('initializes with default data', () => {
    const { result } = renderHook(() => useRealTimeData(initialDevices));
    expect(result.current[10]).toEqual({
      id: 10,
      voltage: 0,
      current: 0,
      activePower: 0,
      reactivePower: 0,
      apparentPower: 0,
      powerFactor: 0,
      status: 'offline',
      lastUpdate: 0,
    });
  });

  it('updates state when receiving a message', () => {
    const { result } = renderHook(() => useRealTimeData(initialDevices));

    act(() => {
      mockEventSourceInstance.onmessage!({
        data: JSON.stringify({ 
          type: 'update', 
          id: 10, 
          voltage: 230, 
          current: 5, 
          activePower: 1.1,
          reactivePower: 0.5,
          apparentPower: 1.2,
          powerFactor: 0.95
        }),
      } as MessageEvent);
    });

    expect(result.current[10].voltage).toBe(230);
    expect(result.current[10].activePower).toBe(1.1);
    expect(result.current[10].status).toBe('online');
  });

  it('marks device as offline after timeout', () => {
    const { result } = renderHook(() => useRealTimeData(initialDevices));

    act(() => {
      mockEventSourceInstance.onmessage!({
        data: JSON.stringify({ type: 'update', id: 10, voltage: 230, current: 5, activePower: 1.1 }),
      } as MessageEvent);
    });

    expect(result.current[10].status).toBe('online');

    // Fast-forward 13 seconds (timeout is 10s, interval is 2s)
    act(() => {
      vi.advanceTimersByTime(13000);
    });

    expect(result.current[10].status).toBe('offline');
  });
});
