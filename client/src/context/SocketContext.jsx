import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestToast, setLatestToast] = useState(null);

  // Fetch initial notifications when user logs in
  useEffect(() => {
    async function fetchNotifications() {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      try {
        const res = await api.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // Notifications endpoint might not be ready yet in early phases
      }
    }
    fetchNotifications();
  }, [user]);

  // Manage socket lifecycle
  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('join', user._id || user.id);
    });

    // Real-time match event
    socketInstance.on('match_found', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setLatestToast({
        id: Date.now(),
        type: 'match',
        title: 'High-Confidence Match Found!',
        message: data.message || 'A matching lost/found item has been identified by the AI matching engine.',
        item: data
      });
    });

    socketInstance.on('claim_update', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setLatestToast({
        id: Date.now(),
        type: 'claim',
        title: 'Item Claim Update',
        message: data.message,
        item: data
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, token]);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const dismissToast = () => setLatestToast(null);

  const value = {
    socket,
    notifications,
    unreadCount,
    latestToast,
    dismissToast,
    markAllAsRead,
    markAsRead
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
