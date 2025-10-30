/* eslint-disable no-unused-vars */
import { useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import farmerImage from "../../assets/images/green-beans.jpg";
import buyerImage from "../../assets/images/brewed-coffee-3.jpg";
import { em } from "framer-motion/client";

export default function Login(){
    const [role, setRole] = useState("buyer");
    const [credentials,setCredentials] = useState({ email: "", password: ""});

    const handleChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
          //send login request
          const response = await api.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
            role,
          },
          { withCredentials: true ,

          }
          );

          const user = response.data.user || response.data.data?.user;

          localStorage.setItem("user", JSON.stringify(user));

    // ✅ Show welcome message
    alert(`Welcome back, ${user?.firstName || "user"}!`);

    // ✅ Redirect based on role
    if (user?.role === "farmer") {
      window.location.href = "/farmer/dashboard";
    } else if (user?.role === "buyer") {
      window.location.href = "/buyer/dashboard";
    } else {
      window.location.href = "/";
    }

  } catch (error) {
    console.error("Login failed:", error);

    // Try to show backend validation message if it exists
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Login failed. Please check your credentials and try again.";
    alert(message);
  }

  console.log(`Logging in as ${role}:`, credentials);
};
          
    return(
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

      {/*Right form*/}
      <motion.div
      className="md:w-1/2 flex items-center justify-center p-10"
      initial={{ opacity: 0, x: 100}}
      animate={{ opacity: 1, x: 0}}
      transition={{ duration: 0.8}}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#2a2520] p-8 rounded-2xl shadow-lg w-full max-w-md text-gray-800 dark:text-gray-100 transition-colors duration-300"
        >
          <h2 className="text-3xl font-bold text-[#3B1F0E] dark:text-[#c49a6c] mb-2 text-center font-archivo">
            Log In as {role === "buyer" ? "Buyer" : "Farmer"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
            Welcome back to Shamba2Shelf — connecting farms and buyers.
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

          {/* Email & Password */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={credentials.email}
            onChange={handleChange}
            required
            className="w-full mb-4 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full mb-6 p-3 border border-gray-300 dark:border-[#3a322b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#3B1F0E] dark:bg-[#c49a6c] text-white dark:text-[#1f1b18] py-3 rounded-md hover:bg-[#291208] dark:hover:bg-[#b18755] transition"
          >
           Log In
          </button>

          {/*footer*/}
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
             Dont have an account?{" "}
             <Link to="/signup" className="text-[#3B1F0E] dark:text-[#c49a6c] hover:underline font-semibold">
                Sign Up
            </Link>
          </p> 
          </form>
      </motion.div>
    </div>);
}