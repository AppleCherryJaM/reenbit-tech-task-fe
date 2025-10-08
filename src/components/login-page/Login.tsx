import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

export const Login: React.FC = () => {
  const { login } = useAuth();

  // В components/Login.tsx
	const handleGoogleSuccess = async (credentialResponse: any) => {
		try {
			console.log('🔐 Login: Google login successful');
			console.log('🔐 Login: Credential response:', credentialResponse);
			
			if (!credentialResponse.credential) {
				console.error('❌ Login: No credential in response');
				return;
			}
			
			console.log('🔐 Login: Calling login function with token...');
			await login(credentialResponse.credential);
			console.log('✅ Login: Login function completed');
			
			// Проверим сохранился ли токен
			const token = localStorage.getItem('auth_token');
			console.log('🔐 Login: Token in localStorage after login:', token ? 'YES' : 'NO');
			
		} catch (error) {
			console.error('❌ Login: Login error:', error);
		}
	};

  const handleGoogleError = () => {
    console.error('❌ Google login failed');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to ChatApp</h1>
        <p>Sign in to start chatting</p>
        
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
};