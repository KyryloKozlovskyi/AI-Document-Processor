import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useAdmin } from "./AdminViews/AdminContext";

const NavigationBar = () => {
  const { isAdmin, logout } = useAdmin();

  return (
    <Navbar bg="primary" data-bs-theme="dark">
      <Navbar.Brand className="p-2" href="/">
        Navbar
      </Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link className="px-2" href="/">Home</Nav.Link>
        <Nav.Link className="px-2" href="/submit">Submit</Nav.Link>
        <Nav.Link className="px-2" href="/about">About</Nav.Link>
      </Nav>
      <Nav>
        {isAdmin ? (
          <>
            <Nav.Link href="/admin">Admin Panel</Nav.Link>
            <Nav.Link className="px-4" onClick={logout}>Logout</Nav.Link>
          </>
        ) : (
          <Nav.Link className="px-4" href="/login">
            Login
          </Nav.Link>
        )}
      </Nav>
    </Navbar>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(NavigationBar);
