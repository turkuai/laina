import { useState } from 'react';

/**
 * Custom hook for managing password form state and handlers
 * @returns {Object} Object containing passwordForm state, passwordStatus, and handler functions
 */
export const usePasswordForm = () => {
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password form status state
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Handler for password input changes
  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  // Handler for password form submission
  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Please fill in all fields before submitting.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setPasswordStatus({ type: 'success', message: 'Password change request submitted. (Demo only)' });
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Handler for clearing password status
  const clearPasswordStatus = () => {
    setPasswordStatus(null);
  };

  return {
    passwordForm,
    passwordStatus,
    handlers: {
      handlePasswordInputChange,
      handlePasswordSubmit,
      clearPasswordStatus
    }
  };
};
