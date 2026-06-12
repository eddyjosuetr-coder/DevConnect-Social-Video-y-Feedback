import { useState, useCallback } from 'react';

export interface User {
  name: string;
  username: string;
  avatar: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeState] = useState<'login' | 'register'>('login');

  const openLogin = useCallback(() => {
    setModeState('login');
    setIsOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setModeState('register');
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    // Simulacion
    setUser({
      name: 'Alejandro Marin',
      username: '@alexmarin',
      avatar: '/images/profile1.jpg',
      role: 'Frontend Dev',
    });
    setIsOpen(false);
    return true;
  }, []);

  const register = useCallback((name: string, email: string, password: string) => {
    setUser({
      name,
      username: `@${name.toLowerCase().replace(/\s/g, '')}`,
      avatar: '/images/profile1.jpg',
      role: 'Developer',
    });
    setIsOpen(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const setMode = useCallback((m: 'login' | 'register') => {
    setModeState(m);
  }, []);

  return {
    user,
    isOpen,
    mode,
    openLogin,
    openRegister,
    closeModal,
    login,
    register,
    logout,
    setMode,
  };
}
