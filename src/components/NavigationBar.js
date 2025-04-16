import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { useAdmin } from "./AdminViews/AdminContext";
// Import icons from React Icons
import {
  FaHome,
  FaFileUpload,
  FaInfoCircle,
  FaUserShield,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";

const NavigationBar = () => {
  const { isAdmin, logout } = useAdmin();

  return (
    <Navbar bg="primary" data-bs-theme="dark" expand="md" collapseOnSelect>
      <Container>
        <Navbar.Brand href="/">AI-Document-Processor</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">
              <FaHome className="me-1" /> Home
            </Nav.Link>
            <Nav.Link href="/submit">
              <FaFileUpload className="me-1" /> Submit
            </Nav.Link>
            <Nav.Link href="/about">
              <FaInfoCircle className="me-1" /> About
            </Nav.Link>
          </Nav>
          <Nav>
            {isAdmin ? (
              <>
                <Nav.Link href="/admin">
                  <FaUserShield className="me-1" /> Admin Panel
                </Nav.Link>
                <Nav.Link onClick={logout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </Nav.Link>
              </>
            ) : (
              <Nav.Link href="/login">
                <FaSignInAlt className="me-1" /> Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(NavigationBar);
