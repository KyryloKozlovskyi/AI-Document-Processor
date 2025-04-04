import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useAdmin } from "./AdminViews/AdminContext";

const NavigationBar = () => {
  const { isAdmin, logout } = useAdmin();

  return (
    <Navbar bg="primary" data-bs-theme="dark">
        <Navbar.Brand className="p-2" href="/">Navbar</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/about">About</Nav.Link>
          <Nav.Link href="/submit">Submit</Nav.Link>
          <Nav.Link href="/preferences">Preferences</Nav.Link> 
        </Nav>
        <Nav>
          {isAdmin ? (
            <>
              <Nav.Link href="/admin">Admin Panel</Nav.Link>
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            </>
          ) : (
            <Nav.Link className="p-2" href="/login">Login</Nav.Link>
          )}
        </Nav>
    </Navbar>
  );
};

export default NavigationBar;
