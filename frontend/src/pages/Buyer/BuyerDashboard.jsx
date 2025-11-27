/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Bell, Trash } from "lucide-react";
import TraceableBatchModal from "../../components/TraceableBatchModal";
import ChatBotWidget from "../../components/ChatBotWidget";
import DeliveryRouteMap from "../../components/DeliveryRouteMap";
import api from "../../api/axios";

export default function BuyerDashboard() {
  
  const [orders, setOrders] = useState([
    { id: "ORD-1001", product: "Arabica Beans - Nyeri", date: "Oct 12, 2025", status: "Delivered" },
    { id: "ORD-1002", product: "Robusta Ground - Kirinyaga", date: "Oct 13, 2025", status: "In Transit" },
    { id: "ORD-1003", product: "Blend Beans - Kiambu", date: "Oct 14, 2025", status: "Pending" },
  ]);

  
  const [savedProducts, setSavedProducts] = useState([
    { id: 1, name: "Arabica Beans - Nyeri", type: "Beans" },
    { id: 2, name: "Robusta Ground - Kirinyaga", type: "Ground Coffee" },
    { id: 3, name: "Blend Beans - Kiambu", type: "Beans" },
  ]);

  
  const [profile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: null,
  });

 
  const [searchOrder, setSearchOrder] = useState("");
  const [searchSaved, setSearchSaved] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");

 
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [buyerLocation, setBuyerLocation] = useState(null);

  
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuyerLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("GPS Error:", err);
        alert("Enable location to plan route.");
      }
    );
  }, []);


  const handlePlanRoute = async () => {
    if (!buyerLocation) {
      alert("Fetching your location… please wait.");
      return;
    }

    setRouteLoading(true);
    setRouteError("");

    try {
      const res = await api.post("/route/optimize", {
        buyerLat: buyerLocation.lat,
        buyerLng: buyerLocation.lng,
      });

      setRouteResult({
        ...res.data,
        buyer: buyerLocation,
      });
    } catch (err) {
      console.error(err);
      setRouteError("Failed to optimize route. Try again.");
    } finally {
      setRouteLoading(false);
    }
  };

  
  const filteredOrders = orders.filter(
    (o) =>
      o.product.toLowerCase().includes(searchOrder.toLowerCase()) &&
      (filterStatus === "All" || o.status === filterStatus)
  );

  const filteredSaved = savedProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchSaved.toLowerCase()) &&
      (filterType === "All" || p.type === filterType)
  );

  const salesData = [
    { month: "Jan", spent: 120 },
    { month: "Feb", spent: 200 },
    { month: "Mar", spent: 150 },
    { month: "Apr", spent: 180 },
    { month: "May", spent: 220 },
    { month: "Jun", spent: 170 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 py-10 px-6 md:px-16 transition-colors duration-300">

     
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-[#3B1F0E] dark:text-amber-400">
          Welcome, {profile.name}!
        </h1>

        <button className="relative p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 transition">
          <Bell className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full"></span>
        </button>
      </div>

      
      <motion.div
        className="flex items-center bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mr-6">
          {profile.avatar && <img src={profile.avatar} alt="Avatar" />}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400">
            {profile.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
        </div>
      </motion.div>

      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4">My Orders</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            placeholder="Search orders..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] flex-grow"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333]"
          >
            <option>All</option>
            <option>Delivered</option>
            <option>In Transit</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500">No orders found.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-b dark:border-gray-700"
                  >
                    <td className="py-3">{o.id}</td>
                    <td>{o.product}</td>
                    <td>{o.date}</td>
                    <td>{o.status}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4">
          Saved Products
        </h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            placeholder="Search saved..."
            value={searchSaved}
            onChange={(e) => setSearchSaved(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] flex-grow"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333]"
          >
            <option>All</option>
            <option>Beans</option>
            <option>Ground Coffee</option>
            <option>Blend</option>
          </select>
        </div>

        <div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg overflow-x-auto">
          {filteredSaved.length === 0 ? (
            <p className="text-center text-gray-500">No saved products.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Type</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredSaved.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-b dark:border-gray-700"
                  >
                    <td className="py-3">{p.name}</td>
                    <td>{p.type}</td>
                    <td>
                      <button
                        onClick={() =>
                          setSavedProducts(savedProducts.filter((x) => x.id !== p.id))
                        }
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        <Trash className="inline-block w-4 h-4" /> Remove
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SPENDING CHART */}
      <motion.div
        className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-center text-[#3B1F0E] dark:text-amber-400 mb-6">
          Monthly Spending Overview
        </h2>

        <div className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="spent" fill="#fbbf24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ROUTE OPTIMIZER */}
      <motion.div
        className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-center text-[#3B1F0E] dark:text-amber-400 mb-6">
          Route Optimization
        </h2>

        <div className="w-full h-64 bg-gray-200 dark:bg-[#333] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
          {buyerLocation && routeResult ? (
            <DeliveryRouteMap
              farmers={routeResult.farmers}
              buyer={routeResult.buyer}
              routeOrder={routeResult.routeOrder}
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {buyerLocation ? "Click Plan Route" : "Getting your location…"}
            </p>
          )}
        </div>

        {routeResult && (
          <div className="text-center text-sm text-gray-700 dark:text-gray-300 mb-4">
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
            disabled={routeLoading}
            className="px-5 py-2 bg-[#3B1F0E] dark:bg-amber-600 text-white rounded-lg hover:opacity-90 disabled:opacity-60 transition"
          >
            {routeLoading ? "Planning Route…" : "Plan Route"}
          </button>
        </div>
      </motion.div>

      
      <ChatBotWidget userRole="buyer" />

      
      {showBatchModal && selectedOrder && (
        <TraceableBatchModal order={selectedOrder} onClose={() => setShowBatchModal(false)} />
      )}
    </div>
  );
}
