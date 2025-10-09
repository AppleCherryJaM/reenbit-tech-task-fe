import "./Header.css";

interface HeaderProps {
  firstName: string;
  lastName: string;
  onLiveMessagesToggle: () => void;
  isLiveMessagesActive: boolean;
}

function Header({ 
  firstName, 
  lastName, 
  onLiveMessagesToggle, 
  isLiveMessagesActive 
}: HeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-avatar">
        {firstName[0]}{lastName[0]}
      </div>
      
      <div className="chat-info-main">
        <div className="chat-name-status">
          <h3 className="chat-name">{firstName} {lastName}</h3>
          <span className="chat-status">Online</span>
        </div>
      </div>

      <div className="chat-actions">
        <button 
          className={`live-messages-btn ${isLiveMessagesActive ? 'active' : ''}`}
          onClick={onLiveMessagesToggle}
        >
          <span className="live-icon">⚡</span>
          <span className="live-text">
            {isLiveMessagesActive ? 'Stop Live' : 'Start Live'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Header;