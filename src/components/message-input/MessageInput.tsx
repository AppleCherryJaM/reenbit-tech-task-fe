import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { SendMessageRequest, Message } from '../../types';
import { apiService } from '../../services/api';
import './MessageInput.css';

interface MessageInputProps {
  chatId: string;
  onMessageSent: (message: Message) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  chatId, 
  onMessageSent, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);

  // Сохраняем фокус при перерисовках
  useEffect(() => {
    if (textareaRef.current && document.activeElement === textareaRef.current) {
      const selectionStart = textareaRef.current.selectionStart;
      const selectionEnd = textareaRef.current.selectionEnd;
      
      // Восстанавливаем фокус и позицию курсора
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  }, [message]);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || disabled || isComposingRef.current) return;

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
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, disabled, chatId, onMessageSent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  }, []);

  // Обработчики для IME (Input Method Editor) - чтобы не ломать ввод на других языках
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

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
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Type a message..."
            disabled={disabled}
            className="message-textarea"
            rows={1}
            maxLength={1000}
            autoFocus
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