/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Checkout() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    county: "",
    payment: "mpesa",
  });

  const cartItems = [
    { id: 1, name: "Arabica Beans", type: "Beans", price: 1200, quantity: 1 },
    { id: 2, name: "Kiambu Ground Coffee", type: "Ground", price: 950, quantity: 2 },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-200 py-16 px-6 md:px-20 transition-colors duration-300 font-adamina">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* ===== PAGE TITLE & PROGRESS ===== */}
        <div className="text-center">
          <motion.h1
            className="text-4xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-3 font-archivo"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Checkout
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Almost there — confirm your order and delivery details.
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-4 text-sm font-semibold">
            {["Cart", "Checkout", "Review", "Complete"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    index === 1
                      ? "bg-[#3B1F0E] dark:bg-amber-500 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mx-2">{step}</span>
                {index < 3 && (
                  <div className="w-10 h-[2px] bg-gray-300 dark:bg-gray-700"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* ===== LEFT: ORDER SUMMARY ===== */}
          <motion.div
            className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[#3B1F0E] dark:text-amber-400 font-archivo">
              Order Summary
            </h2>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-600 pb-3"
              >
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.type} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  KSh {item.price * item.quantity}
                </span>
              </div>
            ))}

            <div className="mt-6 flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-[#3B1F0E] dark:text-amber-400">
                KSh {total}
              </span>
            </div>
          </motion.div>

          {/* RIGHT: SHIPPING / PAYMENT FORM  */}
          <motion.div
            className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[#3B1F0E] dark:text-amber-400 font-archivo">
              Shipping & Payment
            </h2>

            <form className="space-y-4">
              {["name", "email", "address", "county"].map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  placeholder={
                    field === "name"
                      ? "Full Name"
                      : field === "address"
                      ? "Delivery Address"
                      : field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  value={form[field]}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#121212] focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-amber-500"
                />
              ))}

              {/* Payment Method */}
              <div>
                <label className="block mb-2 font-semibold">Payment Method:</label>
                <select
                  name="payment"
                  value={form.payment}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#121212] text-gray-800 dark:text-gray-200"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {/* Proceed Button */}
              <Link
                to="/buyer/order-review"
                className="block w-full text-center bg-[#3B1F0E] dark:bg-amber-600 text-white py-3 rounded-md hover:bg-[#291208] dark:hover:bg-amber-700 transition font-semibold"
              >
                Review Order
              </Link>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
