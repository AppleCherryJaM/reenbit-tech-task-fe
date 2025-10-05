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

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}