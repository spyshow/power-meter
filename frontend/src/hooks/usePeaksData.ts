import { useState, useEffect } from 'react';
import axios from 'axios';

export interface PeakRecord {
  _time: string;
  device_id: string;
  metric: string;
  value: number;
  previous_value?: number;
}

export const usePeaksData = () => {
  const [data, setData] = useState<PeakRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    axios.get('/api/peaks')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch peaks", err);
        setLoading(false);
      });

    // SSE Listener for real-time peaks
    const token = localStorage.getItem('token');
    const url = token ? `/api/events?token=${token}` : '/api/events';
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        if (update.type === 'peak') {
          console.log("[usePeaksData] New peak received:", update);
          const newRecord: PeakRecord = {
            _time: update.timestamp,
            device_id: update.id.toString(),
            metric: update.metric,
            value: update.value,
            previous_value: update.previous_value,
          };
          
          setData((prev) => {
            // Check if we already have this exact peak (prevents duplicates during re-renders)
            const exists = prev.some(r => 
              r.device_id === newRecord.device_id && 
              r.metric === newRecord.metric && 
              r._time === newRecord._time
            );
            if (exists) return prev;
            
            // Add to the beginning of the list (newest first)
            return [newRecord, ...prev].slice(0, 1000); // Limit to last 1000 events
          });
        }
      } catch (err) {
        console.error("Error parsing peak event", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { data, loading };
};
