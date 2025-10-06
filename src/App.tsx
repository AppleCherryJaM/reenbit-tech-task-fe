import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ChatList, WelcomeScreen, ChatWindow } from './components/components';
import { type Chat } from './types';
import { SocketProvider } from './contexts/SocketContext';
import './App.css';

function App() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleNewChat = (chat: Chat) => {
    setSelectedChat(chat); 
  };

  return (
    <SocketProvider>
      <div className="app">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
        
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
    </SocketProvider>
  );
}

export default App;