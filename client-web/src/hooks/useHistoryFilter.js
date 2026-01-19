import { useMemo } from 'react';

/**
 * Custom hook for filtering borrowing history data based on current user role and search query
 * @param {Array} borrowingHistory - Array of borrowing history records
 * @param {Object} currentUser - Current authenticated user object
 * @param {string} query - Search query string
 * @returns {Object} - Object containing filtered history data
 */
export const useHistoryFilter = (borrowingHistory, currentUser, query) => {
  // Internal method - Get borrowing history based on role
  const getBorrowingHistory = useMemo(() => {
    if (currentUser?.role === 'admin') return borrowingHistory;
    return borrowingHistory.filter(r => r.userId === currentUser?.id);
  }, [borrowingHistory, currentUser]);

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!query?.trim()) return getBorrowingHistory;

    const searchQuery = query.toLowerCase();
    return getBorrowingHistory.filter(record =>
      record.userName?.toLowerCase().includes(searchQuery) ||
      record.productName?.toLowerCase().includes(searchQuery) ||
      record.status?.toLowerCase().includes(searchQuery)
    );
  }, [getBorrowingHistory, query]);

  return {
    filteredHistory,
    getBorrowingHistory: () => getBorrowingHistory,
  };
};
