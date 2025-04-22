import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdmin } from "./AdminContext";
import "./styles/Login.css"; // We'll create this file

// Admin login component
const Login = () => {
  // State to store the login credentials
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(""); // State to store the error message
  const navigate = useNavigate(); // Navigation object to redirect the user
  const { login } = useAdmin(); // Function to update the global state with admin details

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send a POST request to the server with the login credentials
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        credentials
      );
      localStorage.setItem("token", response.data.token);
      login(response.data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Admin Login</h1>
        <p className="login-tagline">
          Access the admin dashboard to manage events and submissions
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <Form className="login-form" onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            placeholder="Enter your username"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            placeholder="Enter your password"
            required
          />
        </Form.Group>
        {/* Add button centering styles */}
        <div className="d-flex justify-content-center mb-3">
        <Button variant="primary" type="submit">
          Login
        </Button>
        </div>
      </Form>
    </div>
  );
};

export default Login;
