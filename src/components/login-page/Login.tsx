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
        
				// Временная кнопка для debug
<button 
  onClick={async () => {
    console.log('🧪 Test: Manual auth check');
    const token = localStorage.getItem('auth_token');
    console.log('🧪 Current token:', token);
    
    if (token) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('🧪 Auth check result:', data);
      } catch (error) {
        console.error('🧪 Auth check error:', error);
      }
    }
  }}
  style={{
    marginTop: '20px',
    padding: '10px',
    background: '#ffeb3b',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }}
>
  🧪 Test Auth Check
</button>

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