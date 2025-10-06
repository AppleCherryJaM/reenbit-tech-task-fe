import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { type Chat } from '../../types/index';
import { apiService } from '../../services/api';
import {ChatModal} from '../components';

import './ChatList.css';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
  onNewChat: (chat: Chat) => void; // Изменяем тип - теперь передаем созданный чат
  onChatUpdate?: (chat: Chat) => void; // Добавляем опциональный callback для обновления
}

const ChatList: React.FC<ChatListProps> = ({ 
  onChatSelect, 
  selectedChatId, 
  onNewChat,
  onChatUpdate 
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);

  // Загрузка чатов
  const loadChats = async (search?: string) => {
    try {
      setLoading(true);
      const chatsData = await apiService.getChats(search);
      setChats(chatsData);
      setError(null);
    } catch (err) {
      setError('Failed to load chats');
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании и при изменении поиска
  useEffect(() => {
    loadChats(searchTerm);
  }, [searchTerm]);

  // Обработчик создания чата
  const handleChatCreated = (newChat: Chat) => {
    setChats(prev => [newChat, ...prev]);
    onNewChat(newChat); // Передаем созданный чат в родительский компонент
    setIsModalOpen(false);
		toast.success(`Чат с ${newChat.firstName} ${newChat.lastName} создан!`);
  };

  // Обработчик обновления чата
  const handleChatUpdated = (updatedChat: Chat) => {
    setChats(prev => prev.map(chat => 
      chat.id === updatedChat.id ? updatedChat : chat
    ));
    onChatUpdate?.(updatedChat); // Уведомляем родительский компонент об обновлении
    setIsModalOpen(false);
    setEditingChat(null);
		toast.success('Чат обновлен!');
  };

  // Открытие модалки для редактирования
  const handleEditChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем выбор чата
    setEditingChat(chat);
    setIsModalOpen(true);
  };

  // Обработчик поиска
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Получить последнее сообщение чата
  const getLastMessage = (chat: Chat): string => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    return chat.messages[0].text;
  };

  // Форматирование времени
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Закрытие модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChat(null);
  };

  if (loading && chats.length === 0) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Chats</h2>
        </div>
        <div className="loading">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {/* Заголовок и кнопка нового чата */}
      <div className="chat-list-header">
        <h2>Chats</h2>
        <button 
          className="new-chat-btn"
          onClick={() => setIsModalOpen(true)}
          title="Create new chat"
        >
          +
        </button>
      </div>

      {/* Поиск */}
      <div className="chat-search">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Список чатов */}
      <div className="chats-container">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => loadChats(searchTerm)}>Retry</button>
          </div>
        )}

        {chats.length === 0 ? (
          <div className="no-chats">
            {searchTerm ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'selected' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              <div className="chat-avatar">
                {chat.firstName[0]}{chat.lastName[0]}
              </div>
              
              <div className="chat-content">
                <div className="chat-header">
                  <span className="chat-name">
                    {chat.firstName} {chat.lastName}
                  </span>
                  <div className="chat-header-actions">
                    {chat.messages && chat.messages.length > 0 && (
                      <span className="chat-time">
                        {formatTime(chat.messages[0].createdAt)}
                      </span>
                    )}
                    <button 
                      className="edit-chat-btn"
                      onClick={(e) => handleEditChat(chat, e)}
                      title="Edit chat"
                    >
                      ✎
                    </button>
                  </div>
                </div>
                
                <div className="chat-preview">
                  {getLastMessage(chat)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модалка создания/редактирования чата */}
      <ChatModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onChatCreated={handleChatCreated}
        onChatUpdated={handleChatUpdated}
        editChat={editingChat}
      />
    </div>
  );
};

export default ChatList;