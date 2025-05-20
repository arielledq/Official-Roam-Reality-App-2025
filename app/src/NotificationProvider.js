import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notificationData, setNotificationData] = useState(null);
  const clearNotificationData = () => setNotificationData(null);

  return (
    <NotificationContext.Provider value={{ notificationData, setNotificationData, clearNotificationData }}>
      {children}
    </NotificationContext.Provider>
  );
};
