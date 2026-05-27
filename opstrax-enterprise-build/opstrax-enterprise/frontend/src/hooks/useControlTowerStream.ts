import { useEffect, useState } from 'react';
import { EVENTS_BASE_URL } from '../services/api';
import type { ControlTowerEvent } from '../services/controlTowerApi';

export function useControlTowerStream() {
  const [events, setEvents] = useState<ControlTowerEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const source = new EventSource(`${EVENTS_BASE_URL}/events/stream`);
    source.onopen = () => {
      setConnected(true);
      setError(null);
    };
    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as ControlTowerEvent;
      setEvents((current) => [event, ...current].slice(0, 24));
    };
    source.onerror = () => {
      setConnected(false);
      setError('Reconnecting to live simulation stream');
    };
    return () => source.close();
  }, []);

  return { events, connected, error };
}
