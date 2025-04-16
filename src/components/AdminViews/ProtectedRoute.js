import { Navigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

// ProtectedRoute component to protect admin routes from unauthorized access
// Only allows admin users to access children components
const ProtectedRoute = ({ children }) => {
  const { isAdmin } = useAdmin(); // Use custom useAdmin hook to access admin context
  // If user is not an admin, redirect to login page
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children; // If admin, render the children components
};

export default ProtectedRoute;
