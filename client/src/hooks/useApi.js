import { useState, useEffect, useCallback } from 'react';

export function useApi(fetcher, deps = [], interval = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    load();
    if (interval > 0) {
      const timer = setInterval(load, interval);
      return () => clearInterval(timer);
    }
  }, [load, interval]);

  return { data, loading, error, refetch: load };
}
