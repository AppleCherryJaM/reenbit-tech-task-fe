import axios from 'axios';
import type { Chat, Message, CreateChatRequest, SendMessageRequest, User } from '../types/index';

const API_BASE = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE
});

// Interceptor для автоматического logout при 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🛑 Auto-logout due to 401 error');
      localStorage.removeItem('auth_token');
      // Можно добавить событие для уведомления React компонентов
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Helper function for auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiService = {
  // Chats
  getChats: (search?: string): Promise<Chat[]> => 
    apiClient.get(`${API_BASE}/chats`, { 
      params: { search },
      headers: getAuthHeaders()
    }).then(res => res.data),

  createChat: (data: CreateChatRequest): Promise<Chat> =>
    apiClient.post(`${API_BASE}/chats`, data, {
      headers: getAuthHeaders()
    }).then(res => res.data),

  updateChat: (chatId: string, data: CreateChatRequest): Promise<Chat> =>
    apiClient.put(`${API_BASE}/chats/${chatId}`, data, {
      headers: getAuthHeaders()
    }).then(res => res.data),

  deleteChat: (chatId: string): Promise<void> =>
    apiClient.delete(`${API_BASE}/chats/${chatId}`, {
      headers: getAuthHeaders()
    }),

  // Messages
  getChatMessages: (chatId: string): Promise<Message[]> =>
    apiClient.get(`${API_BASE}/chats/${chatId}/messages`, {
      headers: getAuthHeaders()
    }).then(res => res.data),

  sendMessage: (data: SendMessageRequest): Promise<Message> =>
    apiClient.post(`${API_BASE}/messages`, data, {
      headers: getAuthHeaders()
    }).then(res => res.data),

  // Live Messages
  startLiveMessages: (): Promise<void> =>
    apiClient.post(`${API_BASE}/live-messages/start`, {}, {
      headers: getAuthHeaders()
    }).then(res => res.data),

  stopLiveMessages: (): Promise<void> =>
    apiClient.post(`${API_BASE}/live-messages/stop`, {}, {
      headers: getAuthHeaders()
    }).then(res => res.data),

  // Auth
  googleLogin: (token: string): Promise<{ user: User; token: string; chats: Chat[] }> => {
    console.log('📤 API: Sending Google login request with token length:', token.length);
    return axios.post(`${API_BASE}/auth/google`, { token })
      .then(res => {
        console.log('✅ API: Google login response received:', res.data);
        return res.data;
      })
      .catch(error => {
        console.error('❌ API: Google login error:', error);
        throw error;
      });
  },

  getCurrentUser: (): Promise<{ user: User }> =>
    apiClient.get(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    }).then(res => res.data),
};