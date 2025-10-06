import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type { Message } from '../types';

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🔌 Connecting to global socket...');
    
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Global socket connected!');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Global socket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🚨 Global socket connection error:', error);
    });

    // Глобальный обработчик ВСЕХ сообщений для toast
    socketRef.current.on('message:new', (message: Message) => {
      console.log('🔔 GLOBAL: Received message:', {
        type: message.type,
        chatId: message.chatId,
        text: message.text
      });
      
      // ПОКАЗЫВАЕМ TOAST ДЛЯ ВСЕХ АВТО-ОТВЕТОВ
      if (message.type === 'auto') {
        console.log('🔔 Showing toast for auto message');
        toast(`🤖 Авто-ответ: ${message.text}`);
      }
    });

    return () => {
      console.log('🧹 Cleaning up global socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};