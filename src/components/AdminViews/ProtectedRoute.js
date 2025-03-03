import { Navigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

// ProtectedRoute component to protect admin routes from unauthorized access
const ProtectedRoute = ({ children }) => {
  const { isAdmin } = useAdmin();
  // If user is not an admin, redirect to login page
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
