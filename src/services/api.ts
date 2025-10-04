import axios from 'axios';
import type { Chat, Message, CreateChatRequest, SendMessageRequest } from '../types/index';

const API_BASE = 'http://localhost:3000/api';

export const apiService = {
  // Chats
  getChats: (search?: string): Promise<Chat[]> => 
    axios.get(`${API_BASE}/chats`, { params: { search } }).then(res => res.data),

  createChat: (data: CreateChatRequest): Promise<Chat> =>
    axios.post(`${API_BASE}/chats`, data).then(res => res.data),

  updateChat: (chatId: string, data: CreateChatRequest): Promise<Chat> =>
    axios.put(`${API_BASE}/chats/${chatId}`, data).then(res => res.data),

  deleteChat: (chatId: string): Promise<void> =>
    axios.delete(`${API_BASE}/chats/${chatId}`),

  // Messages
  getChatMessages: (chatId: string): Promise<Message[]> =>
    axios.get(`${API_BASE}/chats/${chatId}/messages`).then(res => res.data),

  sendMessage: (data: SendMessageRequest): Promise<Message> =>
    axios.post(`${API_BASE}/messages`, data).then(res => res.data),
};