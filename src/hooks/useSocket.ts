import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { type Message } from '../types/';

interface UseSocketProps {
  onNewMessage: (message: Message) => void;
  onNotification?: (notification: any) => void;
}

export const useSocket = ({ onNewMessage, onNotification }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Подключаемся к серверу
    socketRef.current = io('http://localhost:5000');

    // Обработчики событий
    socketRef.current.on('message:new', onNewMessage);
    
    if (onNotification) {
      socketRef.current.on('notification:new', onNotification);
    }

    // Очистка при размонтировании
    return () => {
      if (socketRef.current) {
        socketRef.current.off('message:new', onNewMessage);
        if (onNotification) {
          socketRef.current.off('notification:new', onNotification);
        }
        socketRef.current.disconnect();
      }
    };
  }, [onNewMessage, onNotification]);

  // Функция для присоединения к комнате чата
  const joinChat = (chatId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join:chat', chatId);
    }
  };

  // Функция для выхода из комнаты чата
  const leaveChat = (chatId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave:chat', chatId);
    }
  };

  return {
    joinChat,
    leaveChat
  };
};