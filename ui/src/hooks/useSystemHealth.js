import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function useSystemHealth(intervalMs = 10000) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        const json = await res.json();
        setHealth(json);
      } catch {
        setHealth({ status: 'down' });
      }
    };
    load();
    timer = setInterval(load, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return health;
}
