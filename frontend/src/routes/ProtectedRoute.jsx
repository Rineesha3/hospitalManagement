import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { authContext } from "../context/authContext";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = useContext(authContext);
  if (!token) return <Navigate to="/login" replace={true} />;
  if (!allowedRoles.includes(role)) return <Navigate to="/403" replace={true} />;
  return children;
};

export default ProtectedRoute;
