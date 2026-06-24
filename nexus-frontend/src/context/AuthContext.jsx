import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusconnect_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    const { token: newToken, ...userData } = res.data;
    localStorage.setItem('campusconnect_token', newToken);
    localStorage.setItem('cc_user', JSON.stringify({
      userId: userData.id || userData.userId,
      username: userData.username,
      fullName: userData.fullName,
      college: userData.college,
      department: userData.department
    }));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    const { token: newToken, ...rest } = res.data;
    localStorage.setItem('campusconnect_token', newToken);
    setToken(newToken);
    setUser(rest);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('campusconnect_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
