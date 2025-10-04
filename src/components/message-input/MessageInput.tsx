import React, { useState, useRef, useEffect } from 'react';
import type { Message, SendMessageRequest } from '../../types/';
import { apiService } from '../../services/api';
import './MessageInput.css';

interface MessageInputProps {
  chatId: string;
  onMessageSent: (message: Message) => void; // Будем уточнить тип позже
  disabled?: boolean;
}

const MessageInput = ({ 
  chatId, 
  onMessageSent, 
  disabled = false 
} : MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || disabled) return;

    const messageText = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      const sendData: SendMessageRequest = {
        text: messageText,
        chatId: chatId
      };

      const sentMessage = await apiService.sendMessage(sendData);
      onMessageSent(sentMessage);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Восстанавливаем сообщение при ошибке
      setMessage(messageText);
      // TODO: Показать toast с ошибкой
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const isSendDisabled = !message.trim() || isSending || disabled;

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            className="message-textarea"
            rows={1}
            maxLength={1000}
          />
          
          <button
            type="submit"
            disabled={isSendDisabled}
            className={`send-button ${isSendDisabled ? 'disabled' : ''}`}
            title="Send message"
          >
            {isSending ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
        
        <div className="message-info">
          <span className="char-count">
            {message.length}/1000
          </span>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;