
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

export default function AuthLayout({ role, leftImage, children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF9] dark:bg-[#1f1b18] transition-colors duration-300">
      {/* Left Section */}
      <motion.div
        className="md:w-1/2 hidden md:flex items-center justify-center bg-[#3B1F0E] dark:bg-[#2a2520]"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={leftImage}
          alt={role === "buyer" ? "Buyer" : "Farmer"}
          className="object-cover w-full h-full opacity-90"
        />
      </motion.div>

      {/* Right Section */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-10 relative"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-archivo font-bold text-[#3B1F0E] dark:text-[#c49a6c]"
          >
            Shamba2Shelf
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            Connecting Farms & Buyers Seamlessly
          </motion.p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
