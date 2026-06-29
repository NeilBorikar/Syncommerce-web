'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  businessId: string | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedBusiness = localStorage.getItem('business_id');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setBusinessId(storedBusiness);
    }
    setLoading(false);
  }, []);

  const login = async (data: any) => {
    const res = await api.login(data);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('business_id', res.user.business_id);
    setToken(res.access_token);
    setUser(res.user);
    setBusinessId(res.user.business_id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business_id');
    setToken(null);
    setUser(null);
    setBusinessId(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, businessId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
