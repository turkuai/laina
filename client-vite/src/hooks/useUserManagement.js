import { useAuth } from '../components/AuthContext';
import { useNotification } from '../components/NotificationContext';
import { getApiBase } from '../config';

/**
 * Custom hook for managing user operations (delete, edit, etc.)
 * @returns {Object} Object containing user management handlers
 */
export const useUserManagement = () => {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  // Check if user has active (not yet returned) borrowing records
  const checkBorrowingHistory = async (userId) => {
    try {
      const res = await fetch(`${getApiBase()}/api/borrowing-history?borrower_id=${userId}&page=1`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        return false; // If check fails, allow deletion attempt (server will handle constraint)
      }

      // Check content type before parsing
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return false; // If not JSON, allow deletion attempt
      }

      const data = await res.json();
      const history = Array.isArray(data) ? data : (data.history || data.data || []);

      if (!Array.isArray(history)) return false;

      // Only block deletion if the user has at least one ACTIVE borrow
      // i.e. no actual_return_date yet, or status still indicates borrowed
      return history.some((entry) => {
        const notReturned =
          entry.actual_return_date == null ||
          entry.actual_return_date === '' ||
          entry.status === 'borrowed';
        return notReturned;
      });
    } catch (err) {
      console.error('Error checking borrowing history:', err);
      return false; // If check fails, allow deletion attempt
    }
  };

  // Handler for deleting a user with validation
  const handleDeleteUser = async (row) => {
    // Check if trying to delete own account
    if (row.first_name && row.last_name) {
      const fullName = `${row.first_name} ${row.last_name}`;
      if (fullName === currentUser?.name || `${row.first_name}${row.last_name}` === currentUser?.name) {
        showNotification('You cannot delete your own account!', 'error');
        return false; // Prevent deletion
      }
      
      // Check if user has borrowing history / borrowed items
      const hasBorrowingHistory = await checkBorrowingHistory(row.id);
      if (hasBorrowingHistory) {
        showNotification(
          `Cannot delete user "${fullName}" because they have borrowed items / borrowing history. Please return the items first.`,
          'error'
        );
        return false; // Prevent deletion
      }

      return true;
    } else if (row.name === currentUser?.name) {
      showNotification('You cannot delete your own account!', 'error');
      return false; // Prevent deletion
    } else {
      // Check if user has borrowing history / borrowed items
      const hasBorrowingHistory = await checkBorrowingHistory(row.id);
      if (hasBorrowingHistory) {
        showNotification(
          `Cannot delete user "${row.name || row.email}" because they have borrowed items / borrowing history. Please return the items first.`,
          'error'
        );
        return false; // Prevent deletion
      }

      return true;
    }
  };

  return {
    handlers: {
      handleDeleteUser
    }
  };
};
