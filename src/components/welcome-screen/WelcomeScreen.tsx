import './WelcomeScreen.css';

const WelcomeScreen = () => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">💬</div>
        <h1>Welcome to Chat App</h1>
        <p>Select a chat from the list to start messaging</p>
        <div className="welcome-features">
          <div className="feature">
            <span className="feature-icon">🚀</span>
            <span>Real-time messaging</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <span>Auto-responses with quotes</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <span>Quick chat search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;