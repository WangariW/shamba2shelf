/* eslint-disable no-unused-vars */
import { useState } from "react";
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
import { Bell, Trash, MapPin } from "lucide-react";
import TraceableBatchModal from "../../components/TraceableBatchModal";
import ChatBotWidget from "../../components/ChatBotWidget";  

export default function BuyerDashboard() {
  
  const [orders, setOrders] = useState([
    {
      id: "ORD-1001",
      product: "Arabica Beans - Nyeri",
      date: "Oct 12, 2025",
      status: "Delivered",
    },
    {
      id: "ORD-1002",
      product: "Robusta Ground - Kirinyaga",
      date: "Oct 13, 2025",
      status: "In Transit",
    },
    {
      id: "ORD-1003",
      product: "Blend Beans - Kiambu",
      date: "Oct 14, 2025",
      status: "Pending",
    },
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

  
  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowBatchModal(true);
  };

  const handleReorder = (order) => {
    alert(`Reordering: ${order.product}`);
  };

  const handleRemoveSaved = (id) => {
    setSavedProducts(savedProducts.filter((p) => p.id !== id));
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
    <div className="min-h-screen bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 py-10 px-6 md:px-16 transition-colors duration-300 relative">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-[#3B1F0E] dark:text-amber-400">
          Welcome, {profile.name}!
        </h1>

        <button className="relative p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] transition">
          <Bell className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2.5 h-2.5"></span>
        </button>
      </div>

      {/* Profile Card */}
      <motion.div
        className="flex items-center bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mr-6 flex-shrink-0">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400">
            {profile.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
        </div>
      </motion.div>

      {/* Orders Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4">
          My Orders
        </h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] dark:text-gray-200 outline-none flex-grow"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] dark:text-gray-200 outline-none"
          >
            <option>All</option>
            <option>Delivered</option>
            <option>In Transit</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No orders found matching your search.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#333] transition"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <td className="py-3 font-medium">{o.id}</td>
                    <td className="py-3">{o.product}</td>
                    <td className="py-3">{o.date}</td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          o.status === "Delivered"
                            ? "bg-green-500/20 text-green-400"
                            : o.status === "In Transit"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReorder(o)}
                        className="px-3 py-1 rounded-lg bg-[#3B1F0E] dark:bg-amber-600 text-white text-sm"
                      >
                        Reorder
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTrackOrder(o)}
                        className="px-3 py-1 rounded-lg bg-gray-500 dark:bg-gray-700 text-white text-sm"
                      >
                        Track
                      </motion.button>
                    </td>
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
            type="text"
            placeholder="Search saved products..."
            value={searchSaved}
            onChange={(e) => setSearchSaved(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] dark:text-gray-200 outline-none flex-grow"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] dark:text-gray-200 outline-none"
          >
            <option>All</option>
            <option>Beans</option>
            <option>Ground Coffee</option>
            <option>Blend</option>
          </select>
        </div>

        <div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg overflow-x-auto">
          {filteredSaved.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No saved products found.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSaved.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#333] transition"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <td className="py-3">{p.name}</td>
                    <td className="py-3">{p.type}</td>
                    <td className="py-3 flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveSaved(p.id)}
                        className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm flex items-center gap-1"
                      >
                        <Trash className="w-4 h-4" /> Remove
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Spending Chart */}
      <motion.div
        className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-6 text-center">
          Monthly Spending Overview
        </h2>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2b2b2b",
                  borderRadius: "8px",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Bar dataKey="spent" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      
      <motion.div
        className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-6 text-center">
          Route Optimization
        </h2>
        <div className="w-full h-64 bg-gray-200 dark:bg-[#333] rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 mb-6">
          <MapPin className="w-6 h-6 mr-2" /> Google Maps Preview Placeholder
        </div>
        <div className="text-center">
          <button className="px-5 py-2 bg-[#3B1F0E] dark:bg-amber-600 text-white rounded-lg shadow-md hover:opacity-90 transition">
            Plan Route
          </button>
        </div>
      </motion.div>

      
      <ChatBotWidget userRole="buyer" />

      {showBatchModal && selectedOrder && (
        <TraceableBatchModal
          order={selectedOrder}
          onClose={() => setShowBatchModal(false)}
        />
      )}
    </div>
  );
}
