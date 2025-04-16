import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";

const AdminContext = createContext(null); // Initialize context

// AdminProvider component to wrap the application with the context provider
export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the token is present in localStorage when the component starts
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

  // Loading state to show a spinner while verifying the token
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Return the context provider with the value of the context
  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the AdminContext in other components
// This allows you to access the context value without needing to use useContext every time
export const useAdmin = () => useContext(AdminContext);
