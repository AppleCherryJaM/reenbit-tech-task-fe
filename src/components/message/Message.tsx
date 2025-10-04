import React from 'react';
import type { Message as MessageType } from '../../types';
import './Message.css';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  // Форматирование времени сообщения
  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Определение типа сообщения для стилей
  const getMessageType = (): string => {
    if (message.type === 'auto') return 'auto';
    return message.userId ? 'user' : 'system';
  };

  const messageType = getMessageType();

  return (
    <div className={`message ${messageType}`}>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        <div className="message-time">
          {formatMessageTime(message.createdAt)}
        </div>
      </div>
      
      {/* Индикатор авто-ответа */}
      {message.type === 'auto' && (
        <div className="auto-indicator">
          Auto-response
        </div>
      )}
    </div>
  );
};

export default Message;