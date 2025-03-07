import React, { createContext, useState, useEffect } from 'react';
import axios from '../axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state with token
  const [loading, setLoading] = useState(true); // Loading state

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token }); // Set user if token exists
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const res = await axios.post('/auth/login', { username, password }); // Login request
      localStorage.setItem('token', res.data.token); // Store token
      setUser({ token: res.data.token }); // Update user state
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed'; // Extract error
      console.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Signup function
  const signup = async (username, password) => {
    try {
      const res = await axios.post('/auth/signup', { username, password }); // Signup request
      localStorage.setItem('token', res.data.token); // Store token
      setUser({ token: res.data.token }); // Update user state
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed'; // Extract error
      console.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token'); // Remove token
    setUser(null); // Clear user state
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children} // Render children after loading
    </AuthContext.Provider>
  );
};

export default AuthProvider; // Export AuthProvider