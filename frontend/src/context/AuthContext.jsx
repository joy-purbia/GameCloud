import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gamecloud_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gamecloud_token'));
  const [loading, setLoading] = useState(true);

  // Sync token check on startup
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data.user);
            localStorage.setItem('gamecloud_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.login({ identifier, password });
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('gamecloud_token', res.data.token);
      localStorage.setItem('gamecloud_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (username, email, password) => {
    const res = await api.register({ username, email, password });
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('gamecloud_token', res.data.token);
      localStorage.setItem('gamecloud_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gamecloud_token');
    localStorage.removeItem('gamecloud_user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.data.user);
          localStorage.setItem('gamecloud_user', JSON.stringify(res.data.user));
        }
      } catch (e) {
        // Silent refresh error
      }
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
