import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat, Message as MessageType } from '../../types';
import { apiService } from '../../services/api';
import { MessageInput, Message } from '../components';
import { useSocketEnhanced } from '../../hooks/useSocketEnhanced';
import './ChatWindow.css';

interface ChatWindowProps {
  chat: Chat;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasNewAutoResponse, setHasNewAutoResponse] = useState(false);

  // Загрузка сообщений чата
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const messagesData = await apiService.getChatMessages(chat.id);
      console.log('📥 Loaded messages from API:', messagesData.length);
      setMessages(messagesData);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chat.id]);

  // Обработчик новых сообщений из socket
  const handleNewMessage = useCallback((newMessage: MessageType) => {
    console.log('🎯 handleNewMessage called with:', newMessage);
    setMessages(prev => {
      if (prev.some(msg => msg.id === newMessage.id)) {
        console.log('⚠️ Duplicate message detected, skipping');
        return prev;
      }
      console.log('✅ Adding new message to state');
      return [...prev, newMessage];
    });
  }, []);

  // Обработчик уведомлений
  const handleNotification = useCallback((notification: any) => {
    console.log('🔔 Notification received:', notification);
  }, []);

  const { joinChat, leaveChat, isConnected, manualReconnect } = useSocketEnhanced({
    onNewMessage: handleNewMessage,
    onNotification: handleNotification
  });

  // Обработчик отправки сообщения
  const handleMessageSent = useCallback((newMessage: MessageType) => {
    console.log('✅ User message sent:', newMessage);
    setMessages(prev => [...prev, newMessage]);
    
    // Запускаем поллинг для авто-ответа только после отправки сообщения
    setHasNewAutoResponse(true);
  }, []);

  // Автопрокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // При смене чата
  useEffect(() => {
    if (chat.id) {
      console.log('🔄 Chat changed to:', chat.id);
      loadMessages();
      joinChat(chat.id);
    }

    return () => {
      if (chat.id) {
        leaveChat(chat.id);
      }
    };
  }, [chat.id, loadMessages, joinChat, leaveChat]);

  // Умный поллинг только когда ожидаем авто-ответ
  useEffect(() => {
    if (!hasNewAutoResponse || !chat.id) return;

    console.log('⏰ Starting smart polling for auto-response...');
    
    const pollInterval = setInterval(() => {
      loadMessages();
    }, 1000);

    // Останавливаем поллинг через 10 секунд
    const timeout = setTimeout(() => {
      console.log('⏹️ Stopping smart polling');
      setHasNewAutoResponse(false);
      clearInterval(pollInterval);
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [hasNewAutoResponse, chat.id, loadMessages]);

  // Останавливаем поллинг когда приходит авто-ответ
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'auto' && hasNewAutoResponse) {
      console.log('✅ Auto-response received, stopping polling');
      setHasNewAutoResponse(false);
    }
  }, [messages, hasNewAutoResponse]);

  // Прокрутка при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      {/* Заголовок чата с индикатором подключения */}
      <div className="chat-header">
        <div className="chat-avatar">
          {chat.firstName[0]}{chat.lastName[0]}
        </div>
        <div className="chat-info">
          <h3>{chat.firstName} {chat.lastName}</h3>
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className='status-text'>{isConnected ? 'Connected' : 'Disconnected'}</span>
            {!isConnected && (
              <button onClick={manualReconnect} className="reconnect-btn">
                Reconnect
              </button>
            )}
          </div>
        </div>
      </div>

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
              <Message 
                key={message.id} 
                message={message} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Компонент ввода сообщений */}
      <MessageInput 
        key={chat.id}
        chatId={chat.id}
        onMessageSent={handleMessageSent}
        disabled={loading}
      />
    </div>
  );
};

export default ChatWindow;