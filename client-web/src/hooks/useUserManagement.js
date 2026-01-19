import { useAuth } from '../components/AuthContext';

/**
 * Custom hook for managing user operations (delete, edit, etc.)
 * @returns {Object} Object containing user management handlers
 */
export const useUserManagement = () => {
  const { currentUser } = useAuth();

  // Check if user has borrowing history
  const checkBorrowingHistory = async (userId) => {
    try {
      const res = await fetch(`/api/borrowing-history?borrower_id=${userId}&page=1`, {
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
      const history = data.history || [];
      
      // Check if user has any borrowing records
      return history.length > 0;
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
        alert("You cannot delete your own account!");
        return false; // Prevent deletion
      }
      
      // Check if user has borrowing history
      const hasBorrowingHistory = await checkBorrowingHistory(row.id);
      if (hasBorrowingHistory) {
        alert(`Cannot delete user "${fullName}" because they have borrowing history. Please return all borrowed items first.`);
        return false; // Prevent deletion
      }
      
      if (window.confirm(`Are you sure you want to delete user "${fullName}"?`)) {
        return true; // Allow deletion
      }
      return false; // User cancelled
    } else if (row.name === currentUser?.name) {
      alert("You cannot delete your own account!");
      return false; // Prevent deletion
    } else {
      // Check if user has borrowing history
      const hasBorrowingHistory = await checkBorrowingHistory(row.id);
      if (hasBorrowingHistory) {
        alert(`Cannot delete user "${row.name || row.email}" because they have borrowing history. Please return all borrowed items first.`);
        return false; // Prevent deletion
      }
      
      if (window.confirm(`Are you sure you want to delete user "${row.name || row.email}"?`)) {
        return true; // Allow deletion
      }
      return false; // User cancelled
    }
  };

  return {
    handlers: {
      handleDeleteUser
    }
  };
};
