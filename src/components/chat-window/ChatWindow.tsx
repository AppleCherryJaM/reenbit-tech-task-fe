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

  // Обработчик новых сообщений для этого конкретного чата
  const handleNewMessage = useCallback((newMessage: MessageType) => {
    console.log('💬 CHAT WINDOW: New message for this chat:', newMessage);
    
    setMessages(prev => {
      if (prev.some(msg => msg.id === newMessage.id)) {
        console.log('⚠️ Duplicate message detected, skipping');
        return prev;
      }
      console.log('✅ Adding new message to chat state');
      return [...prev, newMessage];
    });
  }, []);

  // Используем отдельный socket для этого чата
  const { joinChat, leaveChat, isConnected, manualReconnect } = useSocketEnhanced({
    onNewMessage: handleNewMessage
  });

  // Загрузка сообщений чата
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const messagesData = await apiService.getChatMessages(chat.id);
      setMessages(messagesData);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chat.id]);

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

  // Обработчик отправки сообщения
  const handleMessageSent = useCallback((newMessage: MessageType) => {
    console.log('✅ User message sent:', newMessage);
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Автопрокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

      <MessageInput 
        chatId={chat.id}
        onMessageSent={handleMessageSent}
        disabled={loading}
      />
    </div>
  );
};

export default ChatWindow;