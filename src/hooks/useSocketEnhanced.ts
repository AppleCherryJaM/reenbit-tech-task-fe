import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import type { Message } from '../types';

const API_BASE = import.meta.env.VITE_SOCKET_URL  || 'http://localhost:3000';

interface UseSocketProps {
  onNewMessage: (message: Message) => void;
  onNotification?: (notification: any) => void;
}

export const useSocketEnhanced = ({ onNewMessage, onNotification }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connect = useCallback(() => {
    console.log('🔌 Connecting to chat socket...');
    
    socketRef.current = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Chat socket connected! ID:', socketRef.current?.id);
      setIsConnected(true);
      setReconnectAttempts(0);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Chat socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🚨 Chat socket connection error:', error.message);
      setIsConnected(false);
      setReconnectAttempts(prev => prev + 1);
    });

    socketRef.current.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Chat socket reconnection attempt ${attempt}`);
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('💥 Chat socket failed to reconnect after multiple attempts');
    });

    // Обработчики сообщений для конкретного чата
    socketRef.current.on('message:new', (message: Message) => {
      console.log('📨 CHAT SOCKET: Received message:', message);
      onNewMessage(message);
    });
    
    if (onNotification) {
      socketRef.current.on('notification:new', (notification: any) => {
        console.log('🔔 Chat socket notification:', notification);
        onNotification(notification);
      });
    }
  }, [onNewMessage, onNotification]);

  useEffect(() => {
    connect();

    return () => {
      console.log('🧹 Cleaning up chat socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [connect]);

  const joinChat = useCallback((chatId: string) => {
    if (socketRef.current && isConnected) {
      console.log(`🎯 Joining chat room: chat:${chatId}`);
      socketRef.current.emit('join:chat', chatId);
    } else {
      console.warn('⚠️ Chat socket not connected, cannot join chat');
    }
  }, [isConnected]);

  const leaveChat = useCallback((chatId: string) => {
    if (socketRef.current && isConnected) {
      console.log(`🚪 Leaving chat room: chat:${chatId}`);
      socketRef.current.emit('leave:chat', chatId);
    }
  }, [isConnected]);

  const manualReconnect = useCallback(() => {
    console.log('🔄 Manual reconnection triggered');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    } else {
      connect();
    }
  }, [connect]);

  return {
    joinChat,
    leaveChat,
    isConnected,
    reconnectAttempts,
    manualReconnect
  };
};