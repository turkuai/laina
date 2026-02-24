import { useNotification } from './NotificationContext';
import { apiUrl } from '../utils/config';

/**
 * Hook for deleting data from server
 * @param {string} path - API endpoint path
 * @param {Function} fetchData - Function to refresh data after successful delete
 * @param {Function} setError - State setter for error state
 * @returns {Function} performDelete function
 */
export function useServerDelete(path, fetchData, setError) {
  const { showNotification } = useNotification();

  const performDelete = async (row) => {
    if (!row.id) {
      console.error('Row has no ID');
      return;
    }

    try {
      const rawPath = `${path.split('?')[0]}/${row.id}`;
      const deleteUrl = apiUrl(rawPath.startsWith('/') ? rawPath : `/${rawPath}`);

      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Try to parse response as JSON, but handle HTML/plain text errors
      let responseData = {};
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          responseData = await res.json();
        } catch (e) {
          // If JSON parse fails, use empty object
        }
      }

      if (!res.ok) {
        // Check for database constraint errors
        const errorMessage = responseData.error || responseData.message || `Delete failed with status ${res.status}`;

        // Check if it's a foreign key constraint error
        const errorStr = String(errorMessage).toLowerCase();
        if (errorStr.includes('foreign key constraint') ||
          errorStr.includes('borrow_history') ||
          errorStr.includes('cannot delete') ||
          errorStr.includes('1451')) {
          showNotification(
            'Cannot delete user because they have borrowing history. Please return all borrowed items first.',
            'error'
          );
          throw new Error('Cannot delete user because they have borrowing history. Please return all borrowed items first.');
        }

        showNotification(errorMessage, 'error');
        throw new Error(errorMessage);
      }

      // Refresh data after successful deletion
      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete item: ${err.message}`);
    }
  };

  return performDelete;
}
