import React, { useState, useEffect } from 'react';
import type { Chat, CreateChatRequest, UpdateChatRequest } from '../../types';
import { apiService } from '../../services/api';
import { Modal } from '../components';
import './ChatModal.css';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated?: (chat: Chat) => void;
  onChatUpdated?: (chat: Chat) => void;
  editChat?: Chat | null;
}

const ChatModal: React.FC<ChatModalProps> = ({ 
  isOpen, 
  onClose, 
  onChatCreated, 
  onChatUpdated,
  editChat 
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  // Сбрасываем форму при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      if (editChat) {
        setFirstName(editChat.firstName);
        setLastName(editChat.lastName);
      } else {
        setFirstName('');
        setLastName('');
      }
      setErrors({});
    }
  }, [isOpen, editChat]);

  const validateForm = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (editChat) {
        // Редактирование чата
        const updateData: UpdateChatRequest = { firstName, lastName };
        const updatedChat = await apiService.updateChat(editChat.id, updateData);
        onChatUpdated?.(updatedChat);
      } else {
        // Создание нового чата
        const createData: CreateChatRequest = { firstName, lastName };
        const newChat = await apiService.createChat(createData);
        onChatCreated?.(newChat);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving chat:', error);
      setErrors({ 
        firstName: 'Failed to save chat. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const modalTitle = editChat ? 'Edit Chat' : 'Create New Chat';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="chat-modal-form">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`form-input ${errors.firstName ? 'error' : ''}`}
            placeholder="Enter first name"
            disabled={loading}
            autoFocus
          />
          {errors.firstName && (
            <span className="error-message">{errors.firstName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`form-input ${errors.lastName ? 'error' : ''}`}
            placeholder="Enter last name"
            disabled={loading}
          />
          {errors.lastName && (
            <span className="error-message">{errors.lastName}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner-small"></div>
                {editChat ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editChat ? 'Update Chat' : 'Create Chat'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChatModal;