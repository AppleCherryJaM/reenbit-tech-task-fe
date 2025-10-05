import React, { useState } from 'react';
import { ChatList, WelcomeScreen } from './components/components';
import { type Chat } from './types';
import './App.css';
import ChatWindow from './components/chat-window/ChatWindow';

function App() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleNewChat = (chat: Chat) => {
    setSelectedChat(chat); 
  };

  return (
    <div className="app">
      <ChatList 
        onChatSelect={handleChatSelect}
        selectedChatId={selectedChat?.id}
        onNewChat={handleNewChat}
      />
      
      <div className="chat-screen">
        {selectedChat ? (
          <ChatWindow chat={selectedChat}/>
        ) : (
          <WelcomeScreen/>
        )}
      </div>
    </div>
  );
}

export default App;