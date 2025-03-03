import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext(null); // Initialize context

// AdminProvider component to wrap the application with the context provider
export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Function to verify the token
  const verifyToken = async (token) => {
    try {
      await axios.get("http://localhost:5000/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(true);
    } catch (err) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // Function to login
  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAdmin(true);
  };

  // Function to logout
  const logout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Return the context provider with the value of the context
  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
