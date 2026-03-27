import { useCallback } from 'react';
import { getApiBase } from '../config';

/**
 * Generic function for fetching data from server with pagination and search
 * @param {string} path - API endpoint path
 * @param {number} currentPage - Current page number
 * @param {string} query - Search query string
 * @param {number} limit - Items per page
 * @returns {Promise<{rows: Array, pages: number}>} Fetched data
 */
export async function fetchServerData(path, currentPage = 1, query = '', limit = 20) {
  if (!path) return { rows: [], pages: 1 };

  // Build the full URL with page parameter
  let fullUrl = path;
  // Ensure /api/ prefix if not present; avoid accidental double slashes
  if (!fullUrl.startsWith('/api/')) {
    const cleanPath = fullUrl.startsWith('/') ? fullUrl.slice(1) : fullUrl;
    fullUrl = `/api/${cleanPath}`;
  }
  
  const separator = fullUrl.includes('?') ? '&' : '?';
  fullUrl = `${fullUrl}${separator}page=${currentPage}&limit=${limit}`;

  // Optional server-side search
  const trimmedQuery = (query || '').trim();
  if (trimmedQuery !== '') {
    fullUrl = `${fullUrl}&search=${encodeURIComponent(trimmedQuery)}`;
  }

  const res = await fetch(getApiBase() + fullUrl, {
    method: 'GET',
    credentials: 'include', // Include httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Parse response safely
  const contentType = res.headers.get('content-type') || '';
  let payload;

  if (contentType.includes('application/json')) {
    try {
      payload = await res.json();
    } catch (parseErr) {
      const text = await res.text().catch(() => '');
      const message = text
        ? `Invalid JSON response: ${text.slice(0, 200)}`
        : 'Invalid JSON response from server.';
      throw new Error(message);
    }
  } else {
    const text = await res.text().catch(() => '');
    const message = text
      ? `Unexpected response (status ${res.status}): ${text.slice(0, 200)}`
      : `Unexpected non-JSON response (status ${res.status}).`;
    throw new Error(message);
  }

  if (!res.ok) {
    throw new Error(
      payload?.error ||
      payload?.message ||
      `Request failed with status ${res.status}`
    );
  }
  
  // Handle different response structures
  let rows = [];
  let pages = 1;

  if (Array.isArray(payload)) {
    rows = payload;
    pages = 1;
  } else if (payload.data) {
    rows = payload.data;
    pages = payload.pagination?.totalPages || payload.totalPages || 1;
  } else if (payload.users) {
    rows = payload.users;
    pages = payload.pagination?.totalPages || payload.totalPages || 1;
  } else if (payload.products) {
    rows = payload.products;
    pages = payload.pagination?.totalPages || payload.totalPages || 1;
  } else if (payload.history) {
    rows = payload.history;
    pages = payload.pagination?.totalPages || payload.totalPages || 1;
  }

  return { rows, pages };
}

/**
 * Hook for fetching data from server with pagination and search
 * @param {string} path - API endpoint path
 * @param {number} currentPage - Current page number
 * @param {string} query - Search query string
 * @param {Function} setData - State setter for data
 * @param {Function} setTotalPages - State setter for total pages
 * @param {Function} setLoading - State setter for loading state
 * @param {Function} setError - State setter for error state
 * @param {number} limit - Default page size limit
 * @returns {Function} fetchData function
 */
export function useServerGet(path, currentPage, query, setData, setTotalPages, setLoading, setError, limit = 20) {
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { rows, pages } = await fetchServerData(path, currentPage, query, limit);
      setData(rows);
      setTotalPages(pages);
    } catch (err) {
      console.error('ServerGrid fetch error:', err);
      setError(err.message || 'Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }, [path, currentPage, query, limit, setData, setTotalPages, setLoading, setError]);

  return fetchData;
}
