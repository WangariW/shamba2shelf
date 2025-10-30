import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode){
      document.documentElement.classList.add("dark");
    }else{
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);


  return (
    <header className="w-full bg-white dark:bg-[#1f1b18] border-b border-gray-200 dark:border-[#3a322b] shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-[#f5f5f5] tracking-tight">
          Shamba2Shelf
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-[#c49a6c]font-medium transition">
            Home
          </Link>
          <Link to="/buyer/marketplace" className="text-gray-700 dark:text-gray-300 hover:text-[#c49a6c] font-medium transition">
            Marketplace
          </Link>
          <Link to="/buyer/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-[#c49a6c] font-medium transition">
            Buyer
          </Link>
          <Link to="/farmer/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-[#c49a6c] font-medium transition">
            Farmer
          </Link> 

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-6 px-3 py-2 rounded-md bg-[#c49a6c] hover:bg-[#b18755] text-[#1f1b18] text-sm font-semibold transition"
            >
           {darkMode ? "Light" : "Dark"}
         </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-[#3a322b] px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a2520] transition">
            Log in
          </Link>
          <Link to="/signup" className="bg-gray-900 dark:bg-[#c49a6c] text-white dark:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-[#b18755]-400 transition">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
