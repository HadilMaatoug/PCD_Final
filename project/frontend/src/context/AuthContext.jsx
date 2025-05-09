import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, verifyToken } from "../helpers/api-communicator";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing valid token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await verifyToken();
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (matricule, password) => {
    try {
      const data = await loginUser(matricule, password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsLoggedIn(true);
      
      return data.user;
    } catch (error) {
      throw error;
    }
  };


  const signup = async (matricule, raisonS, email, password) => {
    try {
        const data = await signupUser(matricule, raisonS, email, password);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsLoggedIn(true);
        
        return data.user;
    } catch (error) {
        throw error;
    }
};

  const logout = async () => {
    try {
      // Optional: Call logout API if you have one
      // await api.post('/user/logout');
    } finally {
      // Clear client-side auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};