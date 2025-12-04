import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("accessToken");

  if (loading) {
    return (
    <div className="flex items-center justify-center h-screen">
      <p>Checking authentication...</p>
    </div>
    );
  }


  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If roles specified and user doesn't match, redirect
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}