import { useState, useEffect, useCallback, useRef } from 'react';

import type { Chat, Message as MessageType } from '../../types';

import { apiService } from '../../services/api';
import { MessageInput, Message } from '../components';
import { useSocketEnhanced } from '../../hooks/useSocketEnhanced';
import Header from './components/Header';

import './ChatWindow.css';

interface ChatWindowProps {
  chat: Chat;
}

const ChatWindow= ({ chat } : ChatWindowProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiveMessagesActive, setIsLiveMessagesActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Обработчик новых сообщений
  const handleNewMessage = useCallback((newMessage: MessageType) => {
      console.log('💬 CHAT WINDOW: New message received:', {
        messageChatId: newMessage.chatId,
        currentChatId: chat.id,
        shouldDisplay: newMessage.chatId === chat.id
      });
      
      // Показываем сообщение ТОЛЬКО если оно для этого чата
      if (newMessage.chatId === chat.id) {
        setMessages(prev => {
          if (prev.some(msg => msg.id === newMessage.id)) {
            console.log('⚠️ Duplicate message detected, skipping');
            return prev;
          }
          console.log('✅ Adding new message to chat state');
          return [...prev, newMessage];
        });
      } else {
        console.log('🚫 Ignoring message for different chat');
      }
    }, [chat.id]); // Зависимость от chat.id

  const { joinChat, leaveChat } = useSocketEnhanced({
    onNewMessage: handleNewMessage
  });

  // Загрузка сообщений чата
   const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setMessages([]); // Очищаем сообщения перед загрузкой
      const messagesData = await apiService.getChatMessages(chat.id);
      console.log('📥 Loaded messages for chat:', chat.id, 'Count:', messagesData.length);
      setMessages(messagesData);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [chat.id]);

  // Переключение Live Messages
  const handleLiveMessagesToggle = useCallback(async () => {
    try {
      if (isLiveMessagesActive) {
        await apiService.stopLiveMessages();
        setIsLiveMessagesActive(false);
      } else {
        await apiService.startLiveMessages();
        setIsLiveMessagesActive(true);
      }
    } catch (error) {
      console.error('Error toggling live messages:', error);
    }
  }, [isLiveMessagesActive]);

  // При смене чата
  useEffect(() => {
    if (chat.id) {
      console.log('🔄 Chat changed to:', chat.id);
      loadMessages();
      joinChat(chat.id);
    }

    return () => {
      if (chat.id) {
        console.log('🚪 Leaving chat:', chat.id);
        leaveChat(chat.id);
        setMessages([]);
      }
    };
  }, [chat.id, loadMessages, joinChat, leaveChat]);

    const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Обработчик отправки сообщения
  const handleMessageSent = useCallback((newMessage: MessageType) => {
    setMessages(prev => [...prev, newMessage]);
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="chat-window">
        <Header 
          firstName={chat.firstName}
          lastName={chat.lastName}
          onLiveMessagesToggle={handleLiveMessagesToggle}
          isLiveMessagesActive={isLiveMessagesActive}
        />
        <div className="loading-messages">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <Header 
        firstName={chat.firstName}
        lastName={chat.lastName}
        onLiveMessagesToggle={handleLiveMessagesToggle}
        isLiveMessagesActive={isLiveMessagesActive}
      />

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <MessageInput 
        chatId={chat.id}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default ChatWindow;