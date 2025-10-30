/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-200 flex items-center justify-center px-6 py-16 transition-colors duration-300">
      <motion.div
        className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* ✅ Animated Checkmark */}
        <motion.div
          className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-12 h-12 text-green-600 dark:text-green-400"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <path d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-3 font-archivo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Order Confirmed!
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Thank you for your purchase! We’re preparing your coffee for delivery.
          You’ll receive an email confirmation shortly.
        </motion.p>

        {/* Order Summary Card */}
        <motion.div
          className="bg-white dark:bg-[#252525] rounded-xl p-5 mb-8 shadow-md text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-2 text-[#3B1F0E] dark:text-amber-400">
            Order Details
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Order ID:</strong> #S2S-93241
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Payment:</strong> M-Pesa
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Delivery:</strong> Estimated 2–3 business days
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col md:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            to="/buyer/marketplace"
            className="bg-[#3B1F0E] dark:bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-[#291208] dark:hover:bg-amber-700 transition font-semibold"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition font-semibold"
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
