import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { type Chat } from '../../types/index';
import { apiService } from '../../services/api';
import { ChatModal, DeleteConfirmationModal } from '../components';
import './ChatList.css';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
  onNewChat: (chat: Chat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  onChatSelect, 
  selectedChatId, 
  onNewChat
}) => {
  const { chats, refreshChats } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Загрузка чатов с поиском
  const loadChats = async (search?: string) => {
    try {
      setLoading(true);
      await refreshChats(search); // Передаем search в refreshChats
      setError(null);
    } catch (err) {
      const errorMsg = 'Ошибка загрузки чатов';
      setError(errorMsg);
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик создания чата
  const handleChatCreated = (newChat: Chat) => {
    onNewChat(newChat);
    setIsModalOpen(false);
    refreshChats(searchTerm); // Обновляем с текущим поиском
  };

  // Обработчик обновления чата
  const handleChatUpdated = (updatedChat: Chat) => {
    onNewChat(updatedChat);
    setIsModalOpen(false);
    setEditingChat(null);
    refreshChats(searchTerm); // Обновляем с текущим поиском
  };

  // Функция удаления чата
  const handleDeleteChat = async () => {
    if (!chatToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await apiService.deleteChat(chatToDelete.id);
      
      // Если удаляемый чат был выбран, сбрасываем выбор
      if (selectedChatId === chatToDelete.id) {
        onChatSelect(null as any);
      }
      
      refreshChats(searchTerm); // Обновляем с текущим поиском
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Обработчик поиска
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Загрузка при монтировании и при изменении поиска
  useEffect(() => {
    loadChats(searchTerm);
  }, [searchTerm]);

  // Остальной код без изменений...
  const getLastMessage = (chat: Chat): string => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = chat.messages[0];
    let prefix = '';
    
    if (lastMessage.type === 'auto') {
      prefix = '🤖 ';
    } else if (lastMessage.type === 'system') {
      prefix = '⚡ ';
    }
    
    return prefix + lastMessage.text;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChat(null);
  };

  const handleCloseDeleteModal = () => {
    if (!deleteLoading) {
      setChatToDelete(null);
    }
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

      <div className="chat-search">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

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
                      className="delete-chat-btn"
                      onClick={(e) => setChatToDelete(chat)}
                      title="Delete chat"
                    >
                      🗑️
                    </button>
                    <button 
                      className="edit-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingChat(chat);
                        setIsModalOpen(true);
                      }}
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

      <ChatModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onChatCreated={handleChatCreated}
        onChatUpdated={handleChatUpdated}
        editChat={editingChat}
      />

      <DeleteConfirmationModal
        isOpen={!!chatToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteChat}
        chatName={chatToDelete ? `${chatToDelete.firstName} ${chatToDelete.lastName}` : ''}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ChatList;