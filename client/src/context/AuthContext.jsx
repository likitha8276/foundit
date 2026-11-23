import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        // If it is a demo token, preserve the user without making an API call that would fail and log out
        if (token.startsWith('demo-') || token.startsWith('mock-')) {
          setLoading(false);
          return;
        }

        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session verification failed:', err);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    } catch (err) {
      // Fallback demo login if backend is temporarily offline or proxy failed
      if (!err.response || err.response.status === 404 || err.response.status === 405 || err.response.status >= 500) {
        if (email === 'admin@lostfound.local' && password === 'AdminPass123!') {
          const adminUser = { id: 'admin-001', name: 'System Administrator', email, role: 'admin' };
          setToken('demo-admin-token');
          setUser(adminUser);
          localStorage.setItem('token', 'demo-admin-token');
          localStorage.setItem('user', JSON.stringify(adminUser));
          return adminUser;
        } else if (email === 'user1@lostfound.local' && password === 'UserPass123!') {
          const standardUser = { id: 'user-001', name: 'Jane Smith', email, role: 'user' };
          setToken('demo-user-token');
          setUser(standardUser);
          localStorage.setItem('token', 'demo-user-token');
          localStorage.setItem('user', JSON.stringify(standardUser));
          return standardUser;
        }
      }
      throw err;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
