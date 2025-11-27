/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import DeliveryRouteMap from "../../components/DeliveryRouteMap";
import { geocodeAddress } from "../../utils/geocode";

export default function OrderReview() {
  // temp data — will later come from checkout state
  const user = {
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    address: "123 Coffee Lane, Nairobi",
    county: "Kiambu",
    payment: "M-Pesa",
  };

  const cartItems = [
    { id: 1, name: "Arabica Beans", type: "Beans", price: 1200, quantity: 1 },
    { id: 2, name: "Kiambu Ground Coffee", type: "Ground", price: 950, quantity: 2 },
  ];

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const handlePlanRoute = async () => {
    setRouteLoading(true);
    setRouteError("");

    try {
      const fullAddress = `${user.address}, ${user.county}`;
      const coords = await geocodeAddress(fullAddress);

      if (!coords) {
        setRouteError("Unable to find your delivery address.");
        setRouteLoading(false);
        return;
      }

      const res = await api.post("/route/optimize", {
        buyerLat: coords.lat,
        buyerLng: coords.lng,
      });

      setRouteResult({
        ...res.data,
        buyer: coords,
      });
    } catch (err) {
      console.error(err);
      setRouteError("Failed to load route. Try again.");
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-800 dark:text-gray-200 py-16 px-6 md:px-20 transition-colors duration-300 font-adamina">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-3 font-archivo">
            Review Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Double-check your order details before confirming.
          </p>
        </motion.div>

        {/* Summary Section */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* Order Summary */}
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
                <span className="font-semibold">KSh {item.price * item.quantity}</span>
              </div>
            ))}

            <div className="mt-6 flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-[#3B1F0E] dark:text-amber-400">KSh {total}</span>
            </div>
          </motion.div>

          {/* Shipping Info */}
          <motion.div
            className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[#3B1F0E] dark:text-amber-400 font-archivo">
              Shipping & Payment
            </h2>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Address:</strong> {user.address}</p>
              <p><strong>County:</strong> {user.county}</p>
              <p><strong>Payment:</strong> {user.payment}</p>
            </div>
          </motion.div>
        </div>

        {/* Route Map */}
        <motion.div
          className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4 text-center">
            Delivery Route Overview
          </h2>

          <div className="w-full h-64 bg-gray-200 dark:bg-[#333] rounded-xl overflow-hidden mb-4 flex items-center justify-center">
            {routeResult ? (
              <DeliveryRouteMap
                farmers={routeResult.farmers}
                buyer={routeResult.buyer}
                routeOrder={routeResult.routeOrder}
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Click "Plan Route" to preview your delivery path.
              </p>
            )}
          </div>

          {/* Distance + Time */}
          {routeResult && (
            <div className="text-center mb-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                Distance:{" "}
                <span className="font-semibold">
                  {(routeResult.bestRoute.totalDistance / 1000).toFixed(1)} km
                </span>
              </p>
              <p>
                Estimated Time:{" "}
                <span className="font-semibold">
                  {(routeResult.bestRoute.totalDuration / 60).toFixed(1)} mins
                </span>
              </p>
            </div>
          )}

          {routeError && <p className="text-red-500 text-center">{routeError}</p>}

          <div className="text-center">
            <button
              onClick={handlePlanRoute}
              className="px-6 py-2 bg-[#3B1F0E] dark:bg-amber-600 text-white rounded-lg hover:opacity-90 shadow-md transition"
              disabled={routeLoading}
            >
              {routeLoading ? "Loading Route..." : "Plan Route"}
            </button>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
          <Link
            to="/buyer/checkout"
            className="flex-1 text-center bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition font-semibold"
          >
            Back to Checkout
          </Link>

          <Link
            to="/buyer/order-success"
            className="flex-1 text-center bg-[#3B1F0E] dark:bg-amber-600 text-white py-3 rounded-md hover:bg-[#291208] dark:hover:bg-amber-700 transition font-semibold"
          >
            Confirm Order
          </Link>
        </div>

      </div>
    </div>
  );
}
