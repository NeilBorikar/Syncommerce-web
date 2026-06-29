'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  businessToken: string | null;
  businessId: string | null;
  business: any | null;
  usersInBusiness: any[];
  loginBusiness: (data: any) => Promise<void>;
  registerBusiness: (data: any) => Promise<void>;
  loginUser: (data: any) => Promise<void>;
  logoutUser: () => void;
  logoutBusiness: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [businessToken, setBusinessToken] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [business, setBusiness] = useState<any | null>(null);
  const [usersInBusiness, setUsersInBusiness] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedBusToken = localStorage.getItem('business_token');
    const storedBus = localStorage.getItem('business');
    const storedBusId = localStorage.getItem('business_id');
    const storedUsers = localStorage.getItem('business_users');
    
    if (storedBusToken && storedBus) {
      setBusinessToken(storedBusToken);
      setBusiness(JSON.parse(storedBus));
      setBusinessId(storedBusId);
      if (storedUsers) {
        setUsersInBusiness(JSON.parse(storedUsers));
      }
    }

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginBusiness = async (data: any) => {
    const res = await api.loginBusiness(data);
    localStorage.setItem('business_token', res.business_token);
    localStorage.setItem('business', JSON.stringify(res.business));
    localStorage.setItem('business_id', res.business.id);
    localStorage.setItem('business_users', JSON.stringify(res.users));
    setBusinessToken(res.business_token);
    setBusiness(res.business);
    setBusinessId(res.business.id);
    setUsersInBusiness(res.users);
  };

  const registerBusiness = async (data: any) => {
    const res = await api.registerBusiness(data);
    localStorage.setItem('business_token', res.business_token);
    localStorage.setItem('business', JSON.stringify(res.business));
    localStorage.setItem('business_id', res.business.id);
    setBusinessToken(res.business_token);
    setBusiness(res.business);
    setBusinessId(res.business.id);
    setUsersInBusiness([{id: res.business.owner_id, name: data.owner_name, role: 'owner'}]);
  };

  const loginUser = async (data: any) => {
    const res = await api.loginUser(data);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const logoutBusiness = () => {
    logoutUser();
    localStorage.removeItem('business_token');
    localStorage.removeItem('business');
    localStorage.removeItem('business_id');
    localStorage.removeItem('business_users');
    setBusinessToken(null);
    setBusiness(null);
    setBusinessId(null);
    setUsersInBusiness([]);
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, businessToken, businessId, business, usersInBusiness,
      loginBusiness, registerBusiness, loginUser, logoutUser, logoutBusiness, loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
