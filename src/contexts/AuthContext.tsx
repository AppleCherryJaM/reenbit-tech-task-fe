import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User, Chat } from '../types';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  chats: Chat[];
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshChats: (search?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshChats = async (search?: string) => {
    if (!user) return;
    try {
      const userChats = await apiService.getChats(search);
      setChats(userChats);
    } catch (error) {
      console.error('Error refreshing chats:', error);
    }
  };

	const login = async (token: string) => {
		try {
			console.log('🔐 AuthContext: Login called with token length:', token.length);
			
			const response = await apiService.googleLogin(token);
			console.log('✅ AuthContext: Google login response:', response);
			
			setUser(response.user);
			localStorage.setItem('auth_token', response.token);
			
			// Проверим что сохранилось
			const savedToken = localStorage.getItem('auth_token');
			console.log('🔐 AuthContext: Token saved to localStorage:', savedToken ? 'YES' : 'NO');
			
			if (response.chats) {
				setChats(response.chats);
			} else {
				await refreshChats();
			}
		} catch (error) {
			console.error('❌ AuthContext: Login error:', error);
			throw error;
		}
	};

  const logout = () => {
    setUser(null);
    setChats([]);
    localStorage.removeItem('auth_token');
  };

  const checkAuth = async () => {
		const token = localStorage.getItem('auth_token');
		console.log('🔍 Checking auth, token exists:', !!token);
		
		if (!token) {
			setUser(null);
			setChats([]);
			setLoading(false);
			return;
		}

		try {
			const response = await apiService.getCurrentUser();
			console.log('✅ Auth check successful:', response.user);
			setUser(response.user);
			await refreshChats();
		} catch (error: unknown) {
			console.error('❌ Auth check failed:', error);
			
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					console.log('🚫 401 Unauthorized - user deleted or token invalid');
					
					// Полностью очищаем состояние и localStorage
					localStorage.removeItem('auth_token');
					setUser(null);
					setChats([]);
					
					// Дополнительно: очищаем любые другие связанные данные
					sessionStorage.clear();
				} else {
					console.error('Auth check Axios error:', error.response?.status);
				}
			} else if (error instanceof Error) {
				console.error('Auth check JavaScript error:', error.message);
			}
		} finally {
			setLoading(false);
		}
	};

  useEffect(() => {
		checkAuth();

		// Слушаем события unauthorized из API interceptor
		const handleUnauthorized = () => {
			console.log('🛑 Received unauthorized event - logging out');
			logout();
		};

		window.addEventListener('unauthorized', handleUnauthorized);

		return () => {
			window.removeEventListener('unauthorized', handleUnauthorized);
		};
	}, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      chats, 
      loading, 
      login, 
      logout, 
      checkAuth,
      refreshChats 
    }}>
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