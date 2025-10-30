/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Bell, Search } from "lucide-react";
import NotificationsPanel from "../../components/NotificationsPanel";

export default function FarmerDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    type: "",
    stock: "",
    status: "Active",
    image: null,
  });

  const [products, setProducts] = useState([
    { id: 1, name: "Arabica Beans - Nyeri", type: "Beans", stock: "120 kg", status: "Active" },
    { id: 2, name: "Robusta Ground - Kirinyaga", type: "Ground Coffee", stock: "85 kg", status: "Active" },
    { id: 3, name: "Blend Beans - Kiambu", type: "Beans", stock: "60 kg", status: "Low Stock" },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received: #ORD-1005", read: false },
    { id: 2, message: "Low stock alert: Blend Beans - Kiambu", read: false },
    { id: 3, message: "Batch #BT-304 delivered successfully", read: true },
    { id: 4, message: "Pending shipment: Robusta Ground - Kirinyaga", read: false },
  ]);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((note) => (note.id === id ? { ...note, read: true } : note))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const metrics = [
    { title: "Products Listed", value: products.length },
    { title: "Orders Received", value: 15 },
    { title: "Pending Shipments", value: 4 },
    { title: "Traceable Batches", value: 6 },
  ];

  const salesData = [
    { county: "Nyeri", orders: 8 },
    { county: "Kirinyaga", orders: 5 },
    { county: "Kiambu", orders: 7 },
    { county: "Murang’a", orders: 3 },
    { county: "Embu", orders: 4 },
    { county: "Meru", orders: 6 },
  ];

  const recentOrders = [
    { id: "ORD-1001", buyer: "Jane Mwangi", product: "Arabica Beans - Nyeri", date: "Oct 12, 2025", status: "Delivered" },
    { id: "ORD-1002", buyer: "Peter Kamau", product: "Robusta Ground - Kirinyaga", date: "Oct 13, 2025", status: "In Transit" },
    { id: "ORD-1003", buyer: "Lydia Njeri", product: "Blend Beans - Kiambu", date: "Oct 14, 2025", status: "Pending" },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setPreview(imgURL);
      setNewProduct({ ...newProduct, image: imgURL });
    }
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.type || !newProduct.stock) {
      alert("Please fill in all fields.");
      return;
    }

    const newEntry = { id: products.length + 1, ...newProduct };
    setProducts([...products, newEntry]);
    setIsModalOpen(false);
    setNewProduct({ name: "", type: "", stock: "", status: "Active", image: null });
    setPreview(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? p.type === filterType : true;
    const matchesStatus = filterStatus ? p.status === filterStatus : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenBatchModal = () => {
    setIsBatchModalOpen(true);
  };

  const handleCloseBatchModal = () => {
    setIsBatchModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 py-10 px-6 md:px-16 transition-colors duration-300 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div className="text-center w-full">
          <motion.h1
            className="text-4xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome, Farmer!
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your sales, manage your listings, and track your coffee batches.
          </p>
        </div>

        {/* Notifications */}
        <div className="absolute top-10 right-10" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] transition"
          >
            <Bell className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
          </button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationsPanel
                  notifications={notifications}
                  onMarkRead={handleMarkRead}
                  onClearAll={handleClearAll}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {metrics.map((m, i) => (
          <motion.div
            key={m.title}
            className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400">{m.value}</h3>
            <p className="text-gray-700 dark:text-gray-300 mt-2">{m.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <motion.button
          className="bg-[#3B1F0E] dark:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Product
        </motion.button>

        <motion.button
          className="bg-[#4A2C18] dark:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenBatchModal}
        >
          Traceable Batches
        </motion.button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-lg px-4 py-2 w-full md:w-1/3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#252525] dark:text-gray-200"
        >
          <option value="">All Types</option>
          <option value="Beans">Beans</option>
          <option value="Ground Coffee">Ground Coffee</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#252525] dark:text-gray-200"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Low Stock">Low Stock</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg overflow-x-auto mb-12">
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-6">Your Products</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="pb-3"></th>
              <th className="pb-3">Product Name</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Stock</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, i) => (
              <motion.tr
                key={p.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#333] transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <td className="py-3">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                  )}
                </td>
                <td className="py-3">{p.name}</td>
                <td className="py-3">{p.type}</td>
                <td className="py-3">{p.stock}</td>
                <td className="py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      p.status === "Active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    onClick={handleOpenBatchModal}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View Batch
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Traceable Batch Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#252525] p-8 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-6 text-center">
              Traceable Batch Details
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300 text-center">
              Batch #BT-304 - Robusta Ground (Kirinyaga)
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
              <div
                className="bg-amber-500 h-4 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>

            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✅ Harvested - Oct 1, 2025</li>
              <li>✅ Processed & Packed - Oct 4, 2025</li>
              <li>✅ Shipped - Oct 8, 2025</li>
              <li>⏳ Out for Delivery - Oct 10, 2025</li>
              <li>⬜ Delivered - Pending</li>
            </ul>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseBatchModal}
                className="px-4 py-2 rounded-lg bg-gray-400 dark:bg-gray-600 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
