import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'message',
        message: msg.message || msg.text || 'New message from relief team',
        senderRole: msg.senderRole || 'relief_team',
        incidentId: msg.incidentId || null,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNewIncident = (inc) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'incident',
        message: `New incident: ${inc.type || 'Unknown'} — ${inc.description?.slice(0, 60) || 'No details'}`,
        incidentId: inc._id,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleAlert = (alert) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'alert',
        message: alert.message || 'New alert broadcast',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('incident:new', handleNewIncident);
    socket.on('alert:broadcast', handleAlert);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('incident:new', handleNewIncident);
      socket.off('alert:broadcast', handleAlert);
    };
  }, [socket]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export default NotificationContext;
