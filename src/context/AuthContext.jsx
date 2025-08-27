import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedToken !== 'undefined' && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate that we have valid user data
        if (parsedUser && typeof parsedUser === 'object' && parsedUser._id && parsedUser.email) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          console.warn('Invalid user data found in localStorage, clearing...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // Clear any invalid data
      if (storedToken === 'undefined' || storedUser === 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    // Validate input data before storing
    if (!userData || !userToken || userToken === 'undefined') {
      console.error('Invalid login data provided');
      return;
    }
    
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const register = (userData, userToken) => {
    // Validate input data before storing
    if (!userData || !userToken || userToken === 'undefined') {
      console.error('Invalid registration data provided');
      return;
    }
    
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user && !!token;
  const isSeller = user?.role === 'seller';
  const isBuyer = user?.role === 'buyer';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isSeller,
    isBuyer,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
