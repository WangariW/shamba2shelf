import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call backend to verify the cookie session
        await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true, // important for cookies
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
    // While checking (optional loader)
    return <p>Checking session...</p>;
  }

  // If authenticated, render the requested page
  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
