import { useCallback } from 'react';

/**
 * Hook for fetching data from server with pagination and search
 * @param {string} path - API endpoint path
 * @param {number} currentPage - Current page number
 * @param {string} query - Search query string
 * @param {Function} setData - State setter for data
 * @param {Function} setTotalPages - State setter for total pages
 * @param {Function} setLoading - State setter for loading state
 * @param {Function} setError - State setter for error state
 * @returns {Function} fetchData function
 */
export function useServerGet(path, currentPage, query, setData, setTotalPages, setLoading, setError) {
  const fetchData = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);

    try {
      // Build the full URL with page parameter
      let fullUrl = path;
      // Ensure /api/ prefix if not present; avoid accidental double slashes
      if (!fullUrl.startsWith('/api/')) {
        // Remove leading slash if present to avoid double slashes
        const cleanPath = fullUrl.startsWith('/') ? fullUrl.slice(1) : fullUrl;
        fullUrl = `/api/${cleanPath}`;
      }
      
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}page=${currentPage}`;

      // Optional server-side search
      const trimmedQuery = query.trim();
      if (trimmedQuery !== '') {
        fullUrl = `${fullUrl}&search=${encodeURIComponent(trimmedQuery)}`;
      }

      const res = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parse response safely (handle HTML error pages)
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
        pages = payload.totalPages || 1;
      } else if (payload.users) {
        rows = payload.users;
        pages = payload.totalPages || 1;
      } else if (payload.products) {
        rows = payload.products;
        pages = payload.totalPages || 1;
      } else if (payload.history) {
        rows = payload.history;
        pages = payload.totalPages || 1;
      }

      setData(rows);
      setTotalPages(pages);
    } catch (err) {
      console.error('ServerGrid fetch error:', err);
      setError(err.message || 'Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }, [path, currentPage, query, setData, setTotalPages, setLoading, setError]);

  return fetchData;
}
