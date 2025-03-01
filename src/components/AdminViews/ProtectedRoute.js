import { Navigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

const ProtectedRoute = ({ children }) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
