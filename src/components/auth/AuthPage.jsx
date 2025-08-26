import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = ({ onLoginSuccess, onRegisterSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = (userData) => {
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }
  };

  const handleRegisterSuccess = (userData) => {
    if (onRegisterSuccess) {
      onRegisterSuccess(userData);
    }
  };

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div>
      {isLogin ? (
        <LoginForm
          onSwitchToRegister={switchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterForm
          onSwitchToLogin={switchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
};

export default AuthPage;
