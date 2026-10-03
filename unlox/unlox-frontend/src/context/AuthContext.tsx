import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axiosInstance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'therapist' | 'client' | 'admin';
  avatarUrl?: string;
}

export interface TherapistProfile {
  id: string;
  professionalName: string;
  title: string;
  bio: string;
  specialties: string[];
  languages: string[];
  qualifications: string[];
  sessionTypes: Array<{
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
    currency: string;
    description: string;
  }>;
  profileImage: string;
  slug: string;
  timezone: string;
  bufferMinutes: number;
  subscriptionPlan: 'starter' | 'professional' | 'practice';
}

interface AuthContextType {
  user: User | null;
  therapist: TherapistProfile | null;
  client: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'therapist' | 'client') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [client, setClient] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('unlox_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('unlox_token');
      if (!storedToken) {
        setUser(null);
        setTherapist(null);
        setClient(null);
        setLoading(false);
        return;
      }
      const data: any = await api.get('/auth/me');
      setUser(data.user);
      setTherapist(data.therapist || null);
      setClient(data.client || null);
    } catch (err) {
      console.warn('Authentication token expired or invalid:', err);
      localStorage.removeItem('unlox_token');
      setToken(null);
      setUser(null);
      setTherapist(null);
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data: any = await api.post('/auth/login', { email, password });
    localStorage.setItem('unlox_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setTherapist(data.therapist || null);
    setClient(data.client || null);
  };

  const register = async (payload: any) => {
    const data: any = await api.post('/auth/register', payload);
    localStorage.setItem('unlox_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setTherapist(data.therapist || null);
    setClient(null);
  };

  const logout = () => {
    localStorage.removeItem('unlox_token');
    setToken(null);
    setUser(null);
    setTherapist(null);
    setClient(null);
  };

  const quickDemoLogin = async (role: 'therapist' | 'client') => {
    setLoading(true);
    try {
      if (role === 'therapist') {
        await login('dr.clara@unlox.practice', 'Password123!');
      } else {
        await login('julian.ross@example.com', 'Password123!');
      }
    } catch (err: any) {
      console.error('Quick demo login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        therapist,
        client,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
