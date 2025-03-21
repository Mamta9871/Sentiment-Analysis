// src/components/AuthProvider.js
import React, { createContext, useState, useEffect } from 'react';
import axios from '../axios';
import { toast } from 'react-toastify'; // Import Toastify

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token }); // If you want username, we'll add it later
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setUser({ token: res.data.token, username }); // Store username in state
      toast.success(`Welcome back, ${username}!`, {
        position: "top-right",
        autoClose: 3000,
      }); // Green toast for login success
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
      }); // Red toast for login error
      console.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const signup = async (username, password) => {
    try {
      const res = await axios.post('/auth/signup', { username, password });
      localStorage.setItem('token', res.data.token);
      setUser({ token: res.data.token, username }); // Store username in state
      toast.success(`Welcome aboard, ${username}!`, {
        position: "top-right",
        autoClose: 3000,
      }); // Green toast for signup success
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed';
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
      }); // Red toast for signup error
      console.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    const username = user?.username || 'User'; // Fallback if username isn't set
    localStorage.removeItem('token');
    setUser(null);
    toast.error(`Goodbye, ${username}!`, { // Red toast for logout
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;