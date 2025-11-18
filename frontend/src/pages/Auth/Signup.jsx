/* eslint-disable no-unused-vars */
import { useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import farmerImage from "../../assets/images/farmer-3.jpg";
import buyerImage from "../../assets/images/roasted-beans-2.jpg";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setSuccess("");
  };

  const validateFields = () => {
    const newErrors = {};
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phonePattern = /^\+?[1-9]\d{1,14}$/;

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Enter a valid email.";
    if (!passwordPattern.test(formData.password))
      newErrors.password =
        "Password must include uppercase, lowercase, number & symbol (e.g., Wawa123!).";
    if (formData.phoneNumber && !phonePattern.test(formData.phoneNumber))
      newErrors.phoneNumber = "Use a valid format like +254712345678.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const response = await api.post("/auth/register", { ...formData, role });
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const message =
        error.response?.data?.message || "Signup failed. Please try again.";
      setErrors({ general: message });
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
          Sign Up as {role === "buyer" ? "Buyer" : "Farmer"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Create your account to start trading directly with coffee farmers and buyers.
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

        {[
          { name: "firstName", placeholder: "First Name" },
          { name: "lastName", placeholder: "Last Name" },
          { name: "email", placeholder: "Email Address" },
          { name: "phoneNumber", placeholder: "Phone Number (+254...)" },
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <input
              type={field.name === "email" ? "email" : "text"}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              required={["firstName", "lastName", "email"].includes(field.name)}
              className="w-full p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
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
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {errors.general && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {errors.general}
          </p>
        )}

        {success && (
          <p className="text-green-600 text-sm mb-4 text-center">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white dark:text-[#1f1b18] transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3B1F0E] dark:bg-[#c49a6c] hover:bg-[#291208] dark:hover:bg-[#b18755]"
          }`}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#3B1F0E] dark:text-[#c49a6c] hover:underline font-semibold"
          >
            Log In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
