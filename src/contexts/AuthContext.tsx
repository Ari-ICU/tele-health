'use client';

import { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';
import { User } from '@/types';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  exp: number; // Expiration timestamp
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          // Decode and validate token
          const decoded = jwtDecode<JwtPayload>(storedToken);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp < currentTime) {
            throw new Error('Token expired');
          }

          // Fetch full user profile
          const response = await api.get<User>('/user/profile', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data);
          setToken(storedToken);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        localStorage.removeItem('token');
        setError('Authentication failed. Please log in again.');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  // Focus error message if present
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  const login = async (newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        throw new Error('Token expired');
      }

      // Fetch user profile
      const response = await api.get<User>('/user/profile', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      const userData = response.data;

      // Check onboarding conditions
      if (!userData.profile.hasCompletedProfile || !userData.profile.hasAcceptedTerms) {
        localStorage.setItem('token', newToken);
        setUser(userData);
        setToken(newToken);
        router.push('/onboarding');
        return;
      }

      localStorage.setItem('token', newToken);
      setUser(userData);
      setToken(newToken);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid credentials. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setError(null);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen px-4 sm:px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen px-4 sm:px-6">
        <div
          ref={errorRef}
          tabIndex={-1}
          className="p-4 bg-red-50 text-red-700 rounded-lg text-sm sm:text-base animate-fade-in max-w-md text-center"
        >
          {error}
          <button
            onClick={() => {
              setError(null);
              router.push('/login');
            }}
            className="ml-2 text-red-600 hover:text-red-800 underline"
            aria-label="Retry login"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
