import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true, // send the cookie to backend
        });
        setIsAuth(true);
      } catch (err) {
        console.error("Auth check failed:", err.response?.data?.message || err.message);
        setIsAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuth === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Checking session...</p>
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
