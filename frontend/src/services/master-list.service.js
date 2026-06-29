import { useState, useEffect, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '../lib/config';
import { normalizeKeys } from '../lib/format';

/**
 * Custom hook for fetching and searching a master list from the API.
 * Works for investigation-master, device-master, antibiotic-master, etc.
 *
 * @param {string} endpoint - API endpoint path (e.g. '/api/investigation-master')
 * @param {object} [opts]
 * @param {boolean} [opts.enabled=true] - If false, skip fetch
 * @returns {{ items: object[], loading: boolean, error: string|null, filtered: object[], search: string, setSearch: Function, categories: string[], selectedCategory: string|null, setSelectedCategory: Function }}
 */
export function useMasterList(endpoint, opts = {}) {
  const { enabled = true } = opts;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}${endpoint}`)
      .then((r) => { if (!r.ok) throw new Error(`Failed to load ${endpoint}`); return r.json(); })
      .then((data) => setItems((data || []).map(normalizeKeys)))
      .catch((e) => { setError(e.message); setItems([]); })
      .finally(() => setLoading(false));
  }, [endpoint, enabled]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const item of items) {
      const cat = item.category || item.deviceCategory || item.antibioticClass;
      if (cat) set.add(cat);
    }
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) => {
        return Object.values(item).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(q)
        );
      });
    }
    if (selectedCategory) {
      list = list.filter((item) => {
        return (item.category || item.deviceCategory || item.antibioticClass) === selectedCategory;
      });
    }
    return list;
  }, [items, search, selectedCategory]);

  const reset = useCallback(() => {
    setSearch('');
    setSelectedCategory(null);
  }, []);

  return {
    items,
    loading,
    error,
    filtered,
    search,
    setSearch,
    categories,
    selectedCategory,
    setSelectedCategory,
    reset,
  };
}
