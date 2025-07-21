import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://3dhkilcjpljw.manus.space/api'; // URL do backend Flask deployado

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Importante para enviar cookies de sessão
      });
      const data = await response.json();
      if (data.authenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
      setError('Erro ao verificar autenticação.');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      } else {
        setError(data.error || 'Erro no registo');
        return { success: false, message: data.error || 'Erro no registo' };
      }
    } catch (err) {
      console.error('Erro no registo:', err);
      setError('Erro de rede ou servidor.');
      return { success: false, message: 'Erro de rede ou servidor.' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      } else {
        setError(data.error || 'Credenciais inválidas');
        return { success: false, message: data.error || 'Credenciais inválidas' };
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro de rede ou servidor.');
      return { success: false, message: 'Erro de rede ou servidor.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return { success: true, message: 'Logout realizado com sucesso.' };
      } else {
        setError('Erro no logout');
        return { success: false, message: 'Erro no logout' };
      }
    } catch (err) {
      console.error('Erro no logout:', err);
      setError('Erro de rede ou servidor.');
      return { success: false, message: 'Erro de rede ou servidor.' };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    checkAuthStatus
  };
};

