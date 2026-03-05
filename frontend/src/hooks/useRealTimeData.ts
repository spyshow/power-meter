import { useState, useEffect } from 'react';

export interface DeviceData {
  id: number;
  voltage: number;
  current: number;
  activePower: number;
  reactivePower: number;
  apparentPower: number;
  powerFactor: number;
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
        activePower: 0,
        reactivePower: 0,
        apparentPower: 0,
        powerFactor: 0,
        status: 'offline',
        lastUpdate: 0,
      }
    }), {})
  );

  useEffect(() => {
    if (initialDevices.length === 0) return;

    const token = localStorage.getItem('token');
    const url = token ? `/api/events?token=${token}` : '/api/events';
    const eventSource = new EventSource(url);
    console.log("Connecting to SSE stream at", url);

    eventSource.onopen = () => {
      console.log("SSE Connection opened successfully.");
    };

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'update') {
        console.log("Real-time update received for device:", update.id);
        setData((prev) => ({
          ...prev,
          [update.id]: {
            ...prev[update.id],
            ...update,
            status: update.status || 'online',
            lastUpdate: update.status === 'offline' ? prev[update.id].lastUpdate : Date.now(),
          }
        }));
      }
    };

    eventSource.onerror = () => {
      // If SSE disconnects, we keep the last data
    };

    // Offline detection
    const interval = setInterval(() => {
      const now = Date.now();
      setData((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id in next) {
          if (next[id].status === 'online' && now - next[id].lastUpdate > 10000) {
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
