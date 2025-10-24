import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
  try {
    const response = await fetch('http://localhost:2090/api/auth/validate', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } else {
      // Token invalid or expired — clear state but don't redirect immediately
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    setUser(null);
    setIsAuthenticated(false);
  } finally {
    setIsLoading(false);
  }
};


  const login = async (email, password, role) => {
    try {
      const response = await fetch('http://localhost:2090/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage (excluding token)
        const userData = {
          id: data.userId,
          email: data.email,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, data: userData };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleLogout = async (redirect = true) => {
  try {
    await fetch('http://localhost:2090/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    if (redirect) navigate('/signin');
  }
};


  // Auto-logout when token expires (check every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;