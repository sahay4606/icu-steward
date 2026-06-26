import { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { authService } from '../services/auth.service';
import { storage } from '../utils/storage';

const USER_KEY = '@icu_auth_user';
const TOKEN_KEY = '@icu_auth_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = storage.getItem(USER_KEY);
      const storedToken = storage.getItem(TOKEN_KEY);
      if (storedUser && storedToken) {
        try {
          const fresh = await authService.getMe(storedToken);
          storage.setItem(USER_KEY, JSON.stringify(fresh));
          setUser(fresh);
          setToken(storedToken);
        } catch {
          storage.removeItem(USER_KEY);
          storage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u, token: t } = await authService.login(email, password);
    storage.setItem(USER_KEY, JSON.stringify(u));
    storage.setItem(TOKEN_KEY, t);
    setUser(u);
    setToken(t);
    return u;
  }, []);

  const signup = useCallback(async (name, email, password, hospitalId) => {
    const { user: u, token: t } = await authService.signup(name, email, password, hospitalId);
    storage.setItem(USER_KEY, JSON.stringify(u));
    storage.setItem(TOKEN_KEY, t);
    setUser(u);
    setToken(t);
    return u;
  }, []);

  const logout = useCallback(async () => {
    storage.removeItem(USER_KEY);
    storage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
