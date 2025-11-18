/* eslint-disable no-unused-vars */
import { useState, useContext } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { motion } from "framer-motion";
import farmerImage from "../../assets/images/green-beans.jpg";
import buyerImage from "../../assets/images/brewed-coffee-3.jpg";

import { AuthContext } from "../../context/AuthContext";   

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);            

  const [role, setRole] = useState("buyer");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/auth/login",
        {
          email: credentials.email,
          password: credentials.password,
          role,
        },
        { withCredentials: true }
      );

      const token = response.data.accessToken || response.data.token;
      const user = response.data.user || response.data.data?.user;

      // Save login session
      if (token) localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);                                     
      }

      // Redirect based on role
      if (user?.role === "farmer") {
        navigate("/farmer/dashboard");
      } else if (user?.role === "buyer") {
        navigate("/buyer/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout role={role} leftImage={role === "buyer" ? buyerImage : farmerImage}>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#2a2520] p-8 rounded-2xl shadow-lg w-full max-w-md mt-20 text-gray-800 dark:text-gray-100 transition-colors duration-300"
      >
        <h2 className="text-3xl font-bold text-[#3B1F0E] dark:text-[#c49a6c] mb-2 text-center font-archivo">
          Log In as {role === "buyer" ? "Buyer" : "Farmer"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Welcome back to Shamba2Shelf.
        </p>

        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`px-6 py-2 rounded-l-md ${
              role === "buyer"
                ? "bg-[#3B1F0E] dark:bg-[#c49a6c] text-white dark:text-[#1f1b18]"
                : "bg-gray-200 dark:bg-[#3a322b] text-gray-700 dark:text-gray-300"
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`px-6 py-2 rounded-r-md ${
              role === "farmer"
                ? "bg-[#3B1F0E] dark:bg-[#c49a6c] text-white dark:text-[#1f1b18]"
                : "bg-gray-200 dark:bg-[#3a322b] text-gray-700 dark:text-gray-300"
            }`}
          >
            Farmer
          </button>
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={credentials.email}
          onChange={handleChange}
          required
          className="w-full mb-4 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
        />

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-sm text-gray-500 dark:text-gray-400 select-none"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white dark:text-[#1f1b18] transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3B1F0E] dark:bg-[#c49a6c] hover:bg-[#291208] dark:hover:bg-[#b18755]"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#3B1F0E] dark:text-[#c49a6c] hover:underline font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
