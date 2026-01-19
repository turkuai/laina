import { useMemo } from 'react';


export const useUserFilter = (users, currentUser, query) => {
  // Internal method - Get user data based on role
  const getUserData = useMemo(() => {
    if (currentUser?.role === 'admin') return users;
    return users.filter(u => u.id === currentUser?.id);
  }, [users, currentUser]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!query?.trim()) return getUserData;

    const searchQuery = query.toLowerCase();
    return getUserData.filter(user =>
      user.name?.toLowerCase().includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery) ||
      user.role?.toLowerCase().includes(searchQuery)
    );
  }, [getUserData, query]);

  return {
    filteredUsers,
    getUserData: () => getUserData,
  };
};
