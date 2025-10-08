import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { ChatList, WelcomeScreen, ChatWindow } from './components/components';
import { type Chat } from './types';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/components';
import './App.css';

// Компонент для отображения загрузки
const AppLoading = () => (
  <div className="app-loading">
    <div className="loading-spinner"></div>
    <p className="loading-text">Loading...</p>
  </div>
);

// Основной контент приложения
const AppContent = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { user, loading } = useAuth();

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleNewChat = (chat: Chat) => {
    setSelectedChat(chat); 
  };

  // Showing loading
  if (loading) {
    return <AppLoading />;
  }

  // If user is unauthorized - showing Login page
  if (!user) {
    return <Login />;
  }

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
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log('🔑 Google Client ID:', googleClientId);
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;