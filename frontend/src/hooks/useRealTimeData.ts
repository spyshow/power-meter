import { useState, useEffect } from 'react';

export interface DeviceData {
  id: number;
  voltage: number;
  current: number;
  kva: number;
  status: 'online' | 'offline';
  lastUpdate: number;
}

export const useRealTimeData = (initialDevices: { id: number; name: string }[]) => {
  const [data, setData] = useState<Record<number, DeviceData>>(
    initialDevices.reduce((acc, device) => ({
      ...acc,
      [device.id]: {
        id: device.id,
        voltage: 0,
        current: 0,
        kva: 0,
        status: 'offline',
        lastUpdate: 0,
      }
    }), {})
  );

  useEffect(() => {
    if (initialDevices.length === 0) return;

    const eventSource = new EventSource('http://localhost:3001/events');

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setData((prev) => ({
        ...prev,
        [update.id]: {
          ...update,
          status: 'online',
          lastUpdate: Date.now(),
        }
      }));
    };

    eventSource.onerror = () => {
      // If error, mark all as offline?
      // Actually SSE will auto-reconnect, so let's just keep last data but maybe mark offline after timeout
    };

    // Offline detection
    const interval = setInterval(() => {
      const now = Date.now();
      setData((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id in next) {
          if (next[id].status === 'online' && now - next[id].lastUpdate > 5000) {
            next[id].status = 'offline';
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [initialDevices]);

  return data;
};
