
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Environment-specific
  withCredentials: true, // if your backend sets cookies
});
console.log(api)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employer' | 'freelancer';
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'employer' | 'freelancer') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage (simulating persistent session)
    const token = localStorage.getItem('quickhire_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      // If token is invalid, remove it
      localStorage.removeItem('quickhire_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { user, token } = response.data;
      
      setUser(user);
      localStorage.setItem('quickhire_token', token);
      
      toast.success(`Welcome back, ${user.name}!`);
      
      // Redirect based on role
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/freelancer/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'employer' | 'freelancer') => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      
      const { user, token } = response.data;
      
      setUser(user);
      localStorage.setItem('quickhire_token', token);
      
      toast.success(`Welcome to QuickHire, ${name}!`);
      
      // Redirect based on role
      navigate(role === 'employer' ? '/employer/dashboard' : '/freelancer/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quickhire_token');
    toast.success('You have been logged out');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
