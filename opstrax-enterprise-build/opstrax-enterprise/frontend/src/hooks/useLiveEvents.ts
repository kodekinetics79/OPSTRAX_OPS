import { useEffect, useState } from 'react';
import { EVENTS_BASE_URL } from '../services/api';

export type LiveEvent = {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
};

export function useLiveEvents() {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    const source = new EventSource(`${EVENTS_BASE_URL}/events/stream`);
    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as LiveEvent;
      setEvents((current) => [event, ...current].slice(0, 12));
    };
    source.onerror = () => source.close();
    return () => source.close();
  }, []);

  return events;
}
