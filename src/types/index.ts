export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Chat {
  id: string;
  firstName: string;
  lastName: string;
  userId: string;
  createdAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  text: string;
  type: 'user' | 'auto' | 'system';
  userId?: string;
  chatId: string;
  createdAt: string;
  user?: User;
}

export interface CreateChatRequest {
  firstName: string;
  lastName: string;
}

export interface SendMessageRequest {
  text: string;
  chatId: string;
}

export interface UpdateChatRequest {
  firstName: string;
  lastName: string;
}