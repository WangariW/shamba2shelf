import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { useAuth } from "../../context/useAuth";
import farmerImage from "../../assets/images/green-beans.jpg";
import buyerImage from "../../assets/images/brewed-coffee-3.jpg";
import api from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
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
      const response = await api.post("/auth/login", { ...credentials, role });
      const { accessToken, refreshToken, user } = response.data;


      console.log('✅ Full response:', response.data);
      
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (user) {
        const userWithRole = { ...user, role: user.role || role };

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user._id)
        setUser(userWithRole);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log('Navigating to:', role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard");

      if (role === "farmer"){
        navigate("/farmer/dashboard", { replace: true });
      }else if (role === "buyer"){
        navigate("/buyer/dashboard", { replace: true });
      }else{
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      

      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
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
          Login as {role === "buyer" ? "Buyer" : "Farmer"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Enter your credentials to access your account.
        </p>

        {/* Role toggle buttons */}
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

        {/* Email input */}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />
        </div>

        {/* Password input */}
        <div className="relative mb-4">
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

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white dark:text-[#1f1b18] transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3B1F0E] dark:bg-[#c49a6c] hover:bg-[#291208] dark:hover:bg-[#b18755]"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Link to signup */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          Don't have an account?{" "}
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
