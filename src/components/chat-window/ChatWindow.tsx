import React, { useState, useEffect, useRef } from 'react';

import type { Chat, Message } from '../../types';
import { apiService } from '../../services/api';

import Header from './components/Header';

import './ChatWindow.css';
import { MessageInput } from '../components';

interface ChatWindowProps {
  chat: Chat;
}

const ChatWindow = ({ chat } : ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка сообщений чата
  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await apiService.getChatMessages(chat.id);
      setMessages(messagesData);
      setError(null);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

	  // Обработчик отправки сообщения
  const handleMessageSent = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  // Автопрокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Загрузка сообщений при смене чата
  useEffect(() => {
    if (chat.id) {
      loadMessages();
    }
  }, [chat.id]);

  // Прокрутка при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
  const getMessageType = (message: Message): string => {
    if (message.type === 'auto') return 'auto';
    return message.userId ? 'user' : 'system';
  };

  if (loading && messages.length === 0) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h3>{chat.firstName} {chat.lastName}</h3>
        </div>
        <div className="loading-messages">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Заголовок чата */}
			<Header firstName={chat.firstName} lastName={chat.lastName} />

      {/* Область сообщений */}
      <div className="messages-container">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadMessages}>Retry</button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${getMessageType(message)}`}
              >
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
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Компонент ввода сообщений (сделаем следующим) */}
      <MessageInput 
        chatId={chat.id}
        onMessageSent={handleMessageSent}
        disabled={loading}
      />
    </div>
  );
};

export default ChatWindow;