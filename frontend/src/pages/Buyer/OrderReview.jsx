/* eslint-disable no-unused-vars */
import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DeliveryRouteMap from "../../components/DeliveryRouteMap";
import { geocodeAddress } from "../../utils/geocode";
import CartContext from "../../context/CartContext";
import OrderContext from "../../context/OrderContext";
import { useAuth } from "../../context/useAuth";

export default function OrderReview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkoutData } = useContext(OrderContext);
  const { cartItems: contextCartItems } = useContext(CartContext);

  const cartItems = contextCartItems;

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (!checkoutData || !checkoutData.name || cartItems.length === 0) {
      navigate("/buyer/checkout");
    }
  }, [checkoutData, cartItems, navigate]);

  // Geocode delivery address on page load
  useEffect(() => {
    const geocodeDelivery = async () => {
      if (!checkoutData?.address || !checkoutData?.county) return;
      
      setGeocoding(true);
      try {
        const fullAddress = `${checkoutData.address}, ${checkoutData.county}`;
        const coords = await geocodeAddress(fullAddress);

        if (coords) {
          setDeliveryLocation(coords);
        } else {
          console.warn("Could not geocode delivery address.");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setGeocoding(false);
      }
    };
    
    geocodeDelivery();
  }, [checkoutData]);

  if (!checkoutData || !checkoutData.name) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting to checkout...</p>
      </div>
    );
  }

  const handlePlanRoute = async () => {
    setRouteLoading(true);
    setRouteError("");

    try {
      const fullAddress = `${checkoutData.address}, ${checkoutData.county}`;
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

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            className="bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[#3B1F0E] dark:text-amber-400 font-archivo">
              Order Summary
            </h2>

            {cartItems.map((item, index) => (
              <div
                key={item.id || index}
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
              <p><strong>Name:</strong> {checkoutData.name}</p>
              <p><strong>Email:</strong> {checkoutData.email}</p>
              <p><strong>Address:</strong> {checkoutData.address}</p>
              <p><strong>County:</strong> {checkoutData.county}</p>
              <p><strong>Payment:</strong> {checkoutData.payment}</p>
            </div>
          </motion.div>
        </div>

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
            {geocoding ? (
              <p className="text-gray-600 dark:text-gray-400">Locating your delivery address...</p>
            ) : deliveryLocation ? (
              routeResult ? (
                <DeliveryRouteMap
                  farmers={routeResult.farmers}
                  buyer={routeResult.buyer}
                  routeOrder={routeResult.routeOrder}
                />
              ) : (
                <DeliveryRouteMap
                  initialLocation={deliveryLocation}
                  locationType="delivery"
                />
              )
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Unable to locate delivery address on map
              </p>
            )}
          </div>

          {deliveryLocation && !routeResult && (
            <div className="text-center mb-4">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Delivery location confirmed
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {checkoutData.address}, {checkoutData.county}
              </p>
            </div>
          )}

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
              disabled={routeLoading || !deliveryLocation}
            >
              {routeLoading ? "Loading Route..." : "Plan Route"}
            </button>
          </div>
        </motion.div>

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


