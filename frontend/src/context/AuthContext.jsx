import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [rol, setRol] = useState(localStorage.getItem('rol') || null);

  const login = async (correo, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { correo, password });
    setToken(res.data.token);
    setRol(res.data.rol);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('rol', res.data.rol);
  };

  const logout = () => {
    setToken(null);
    setRol(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  };

  const api = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return (
    <AuthContext.Provider value={{ token, rol, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);