/* eslint-disable no-unused-vars */
import { useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import farmerImage from "../../assets/images/farmer-3.jpg";
import buyerImage from "../../assets/images/roasted-beans-2.jpg";
import { s } from "framer-motion/client";

export default function Signup() {
  const [role, setRole] = useState("buyer");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "buyer",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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
    
    try {
      const response = await api.post("/auth/register", formData);
      console.log("Signup successful:", response.data);
      setErrors({});
      alert("Account created successfully!");
    } catch (error) {
      const message= error.response?.data?.message || "Signup failed. Please try again."; 
      setErrors({general: message});

    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF9] dark:bg-[#1f1b18] transition-colors duration-300">
      {/* Left Image */}
      <motion.div
        className="md:w-1/2 hidden md:flex items-center justify-center bg-[#3B1F0E] dark:bg-[#2a2520]"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={role === "buyer" ? buyerImage : farmerImage}
          alt={role === "buyer" ? "Buyer" : "Farmer"}
          className="object-cover w-full h-full opacity-90"
        />
      </motion.div>

      {/* Right Form */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-10"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#2a2520] p-8 rounded-2xl shadow-lg w-full max-w-md text-gray-800 dark:text-gray-100 transition-colors duration-300"
        >
          <h2 className="text-3xl font-bold text-[#3B1F0E] dark:text-[#c49a6c] mb-2 text-center font-archivo">
            Sign Up as {role === "buyer" ? "Buyer" : "Farmer"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
            Create your account to start trading directly with coffee farmers and buyers.
          </p>

          {/* Role Toggle */}
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

          {/* First Name */}
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full mb-4 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />

          {/* Last Name */}
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full mb-4 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full mb-4 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />

          {/* Phone Number (optional) */}
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number (+254...)"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full mb-4 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mb-6 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#3B1F0E] dark:bg-[#c49a6c] text-white dark:text-[#1f1b18] py-3 rounded-md hover:bg-[#291208] dark:hover:bg-[#b18755] transition"
          >
            Create Account
          </button>

          {/* Footer */}
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-[#3B1F0E] dark:text-[#c49a6c] hover:underline font-semibold">
              Log In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
