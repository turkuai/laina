import { getApiBase } from '../config';

/**
 * Hook for updating data on server
 * @param {string} path - API endpoint path
 * @param {Function} fetchData - Function to refresh data after successful update
 * @param {Function} setError - State setter for error state
 * @returns {Function} handleEdit function
 */
export function useServerPatch(path, fetchData, setError) {
  const handleEdit = async (row) => {
    if (!row.id) {
      console.error('Row has no ID');
      return;
    }

    try {
      let updateUrl = `${path.split('?')[0]}/${row.id}`;
      if (!updateUrl.startsWith('/api/')) {
        const cleanPath = updateUrl.startsWith('/') ? updateUrl.slice(1) : updateUrl;
        updateUrl = `/api/${cleanPath}`;
      }

      // Clone row and drop non-updatable fields; backend will decide what to use
      const payload = { ...row };

      // Special-case combined "name" field (e.g. Users grid)
      if (typeof payload.name === 'string' && payload.name.trim()) {
        const parts = payload.name.trim().split(/\s+/);
        payload.first_name = parts[0];
        payload.last_name = parts.slice(1).join(' ') || '';
      }
      delete payload.name;
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const res = await fetch(getApiBase() + updateUrl, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Update failed with status ${res.status}`);
      }

      // Refresh from server so grid matches DB
      await fetchData();
    } catch (err) {
      console.error('Edit error:', err);
      setError(`Failed to update item: ${err.message}`);
    }
  };

  return handleEdit;
}
