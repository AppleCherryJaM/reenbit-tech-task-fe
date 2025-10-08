import React, { useState, useRef, useEffect } from 'react';
import './DropdownMenu.css';

interface DropdownMenuProps {
  onNewChat: () => void;
  onLogout: () => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ onNewChat, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewChatClick = () => {
    onNewChat();
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div className="dropdown-menu" ref={dropdownRef}>
      <button 
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Menu"
      >
        ⋮
      </button>
      
      {isOpen && (
        <div className="dropdown-content">
          <button 
            className="dropdown-item"
            onClick={handleNewChatClick}
          >
            <span className="dropdown-icon">➕</span>
            Create Chat
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-item logout-item"
            onClick={handleLogoutClick}
          >
            <span className="dropdown-icon">🚪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};