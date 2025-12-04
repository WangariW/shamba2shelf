/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";
import OrderContext from "../../context/OrderContext";
import CartContext from "../../context/CartContext";

export default function OrderSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkoutData } = useContext(OrderContext);
  const { cartItems, clearCart } = useContext(CartContext);
  
  const [orderIds, setOrderIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const ordersCreatedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate order creation
    if (ordersCreatedRef.current) return;
    ordersCreatedRef.current = true;

    const createOrders = async () => {
      // Validate required data
      if (!checkoutData || !checkoutData.name || cartItems.length === 0) {
        navigate("/buyer/checkout");
        return;
      }

      const buyerId = user?._id || user?.id;
      if (!buyerId) {
        setError("User not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Creating orders for buyer:", buyerId);
        console.log("Cart items:", cartItems);

        // Create an order for each cart item
        const orderPromises = cartItems.map(async (item) => {
          // Validate farmerId
          if (!item.farmerId) {
            console.warn("Item missing farmerId:", item);
            throw new Error(`Product "${item.name}" is missing farmer information`);
          }

          const orderData = {
            buyerId: buyerId,
            farmerId: item.farmerId,
            productId: item._id || item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            totalAmount: item.price * item.quantity,
            status: "Pending",
            paymentMethod: checkoutData.payment === "mpesa" ? "M-Pesa" : 
                          checkoutData.payment === "card" ? "Card" : 
                          checkoutData.payment === "bank" ? "Bank Transfer" : "Cash",
            paymentStatus: "Pending",
            deliveryAddress: {
              street: checkoutData.address,
              city: checkoutData.county,
              county: checkoutData.county,
              postalCode: ""
            },
            buyerNotes: ""
          };

          console.log("Creating order:", orderData);

          const response = await api.post("/orders", orderData);
          return response.data._id || response.data.data?._id;
        });

        const createdOrderIds = await Promise.all(orderPromises);
        console.log("Orders created successfully:", createdOrderIds);
        
        setOrderIds(createdOrderIds);
        
        // Clear cart after successful order creation
        clearCart();
        setLoading(false);
      } catch (err) {
        console.error("Failed to create orders:", err);
        setError(err.message || "Failed to create order. Please contact support.");
        setLoading(false);
      }
    };

    createOrders();
  }, [cartItems, checkoutData, user, navigate, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#3B1F0E] dark:border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center px-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Order Failed</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Link
            to="/buyer/checkout"
            className="block text-center bg-[#3B1F0E] dark:bg-amber-600 text-white px-6 py-3 rounded-md hover:opacity-90"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

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
          Thank you for your purchase! We're preparing your coffee for delivery.
          You'll receive an email confirmation shortly.
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
            <strong>Orders Created:</strong> {orderIds.length}
          </p>
          {orderIds.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Order ID:</strong> #{orderIds[0].slice(-8)}
              {orderIds.length > 1 && ` (+${orderIds.length - 1} more)`}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Payment:</strong> {checkoutData?.payment?.toUpperCase() || "M-Pesa"}
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
            to="/buyer/dashboard"
            className="bg-[#3B1F0E] dark:bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-[#291208] dark:hover:bg-amber-700 transition font-semibold"
          >
            View Orders
          </Link>
          <Link
            to="/buyer/marketplace"
            className="border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition font-semibold"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}