import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, verify } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed,  setAuthed]  = useState(false);
  const [checking, setChecking] = useState(true); // still verifying token on mount

  // On mount, verify stored token
  useEffect(() => {
    const token = localStorage.getItem('diary_token');
    if (!token) { setChecking(false); return; }
    verify()
      .then(({ valid }) => setAuthed(valid))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (password) => {
    const { token } = await apiLogin(password);
    localStorage.setItem('diary_token', token);
    setAuthed(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('diary_token');
    setAuthed(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authed, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
