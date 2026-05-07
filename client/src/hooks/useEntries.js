import { useState, useEffect, useCallback } from 'react';
import { fetchEntries, fetchStats, deleteEntry as apiDelete } from '../utils/api';

export const useEntries = () => {
  const [entries, setEntries]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [entriesData, statsData] = await Promise.all([
        fetchEntries(),
        fetchStats(),
      ]);
      setEntries(entriesData.entries);
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeEntry = useCallback(async (id) => {
    await apiDelete(id);
    setEntries((prev) => prev.filter((e) => e._id !== id));
    setStats((prev) => prev ? { ...prev, total: prev.total - 1 } : prev);
  }, []);

  return { entries, stats, loading, error, reload: load, removeEntry };
};
