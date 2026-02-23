import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const hide = useCallback(() => {
    setNotification((prev) => (prev ? { ...prev, visible: false } : null));
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, visible: true });
  }, []);

  // Listen for global notification events (for non-hook code)
  useEffect(() => {
    const handler = (event) => {
      if (!event?.detail) return;
      const { message, type } = event.detail;
      showNotification(message, type || 'success');
    };

    window.addEventListener('app-notification', handler);
    return () => window.removeEventListener('app-notification', handler);
  }, [showNotification]);

  useEffect(() => {
    if (!notification || !notification.visible) return;

    const timer = setTimeout(() => {
      hide();
    }, 2000);

    return () => clearTimeout(timer);
  }, [notification, hide]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {notification && (
        <div
          className={[
            'notification-banner',
            notification.visible ? 'notification-banner--visible' : '',
            notification.type === 'error'
              ? 'notification-banner--error'
              : 'notification-banner--success',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
};

