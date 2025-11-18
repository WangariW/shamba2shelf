/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ChatBotWidget from "../../components/ChatBotWidget";
import NotificationsPanel from "../../components/NotificationsPanel";
import api from "../../api/axios";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User } from "lucide-react";

export default function FarmerDashboard() {
  const dropdownRef = useRef(null);

  const [farmer, setFarmer] = useState(null);
  const [farmerLocation, setFarmerLocation] = useState(null);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const farmerId = localStorage.getItem("userId") || "690a1ef06538883429160a19";

  // -------------------------------
  // FETCH: Farmer profile / location
  // -------------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get(`/farmers/${farmerId}`);
        if (res.data?.data?.farmer) {
          const f = res.data.data.farmer;
          setFarmer(f);
          setFarmerLocation({
            county: f.county,
            town: f.town,
            pickupPoint: f.pickupPoint,
          });
        }
      } catch (err) {
        console.error("Failed to load farmer profile:", err);
      }
    }
    loadProfile();
  }, []);

  // -------------------------------
  // FETCH: Products for this farmer
  // -------------------------------
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get(`/products/farmer/${farmerId}`);
        setProducts(res.data.data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    }
    loadProducts();
  }, []);

  // -------------------------------
  // UI: Close dropdown on click outside
  // -------------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------------------
  // LOCAL NOTIFICATION HANDLERS
  // -------------------------------
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((note) => (note.id === id ? { ...note, read: true } : note))
    );
  };

  const handleClearAll = () => setNotifications([]);

  // -------------------------------
  // FILTER PRODUCTS
  // -------------------------------
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? p.variety === filterType : true;
    const matchesStatus = filterStatus ? p.status === filterStatus : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 py-10 px-6 md:px-16">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="text-center w-full">
          <motion.h1
            className="text-4xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome, {farmer?.firstName || "Farmer"}!
          </motion.h1>

          <p className="text-gray-600 dark:text-gray-400">
            Monitor your sales, manage your listings, and track your coffee batches.
          </p>

          {/* LOCATION SECTION */}
          {farmerLocation && (
            <div className="mt-4 bg-gray-100 dark:bg-[#252525] p-4 rounded-lg shadow text-center">
              <h2 className="text-lg font-semibold text-[#3B1F0E] dark:text-amber-400">Your Pickup Location</h2>
              <p><strong>County:</strong> {farmerLocation.county || "Not set"}</p>
              <p><strong>Town:</strong> {farmerLocation.town || "Not set"}</p>
              <p><strong>Pickup Point:</strong> {farmerLocation.pickupPoint || "Not set"}</p>
            </div>
          )}
        </div>

        {/* RIGHT ICONS */}
        <div className="absolute top-10 right-10 flex items-center gap-4 z-[9999]">

          {/* NOTIFICATIONS */}
          <div ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a]"
            >
              <Bell className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <NotificationsPanel
                    notifications={notifications}
                    onMarkRead={handleMarkRead}
                    onClearAll={handleClearAll}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a]"
            >
              <User className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#252525] shadow-lg rounded-lg py-2">
                <Link to="/farmer/profile" className="block px-4 py-2">Profile</Link>
                <Link to="/logout" className="block px-4 py-2">Logout</Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* METRICS */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <MetricBox title="County" value={farmerLocation?.county || "-"} />
        <MetricBox title="Town" value={farmerLocation?.town || "-"} />
        <MetricBox title="Pickup Point" value={farmerLocation?.pickupPoint || "-"} />
        <MetricBox title="Role" value={farmer?.role || "-"} />
      </div>

      {/* PRODUCT SECTION */}
      <ProductSection
        products={filteredProducts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        handleOpenBatchModal={() => setIsBatchModalOpen(true)}
      />

      {isBatchModalOpen && <BatchModal onClose={() => setIsBatchModalOpen(false)} />}

      <ChatBotWidget userRole="farmer" />
    </div>
  );
}

/* =============================================================
   REUSABLE COMPONENTS
============================================================= */

function MetricBox({ title, value }) {
  return (
    <motion.div className="bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg text-center">
      <h3 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400">{value}</h3>
      <p>{title}</p>
    </motion.div>
  );
}

function ProductSection({
  products,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  handleOpenBatchModal,
}) {
  return (
    <>
      {/* SEARCH + FILTER BAR */}
      <div className="flex gap-4 mb-6 items-center">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-lg px-4 py-2 w-full md:w-1/3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full"
          />
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Varieties</option>
          <option value="SL28">SL28</option>
          <option value="SL34">SL34</option>
          <option value="Ruiru 11">Ruiru 11</option>
          <option value="Batian">Batian</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="OutOfStock">Out Of Stock</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* PRODUCT TABLE */}
      <div className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg overflow-x-auto mb-12">
        <h2 className="text-2xl font-bold mb-6">Your Products</h2>

        {products.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No products yet</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Variety</th>
                <th>Quantity</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="py-3">
                    {p.images?.length > 0 ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.variety}</td>
                  <td>{p.quantity} kg</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        p.status === "Available"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={handleOpenBatchModal} className="text-blue-500">
                      View Batch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </>
  );
}

function BatchModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#252525] p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Traceable Batch Details</h2>

        <ul className="space-y-2">
          <li>Harvested - Oct 1, 2025</li>
          <li>Processed - Oct 4, 2025</li>
          <li>Shipped - Oct 8, 2025</li>
          <li>Delivered - Pending</li>
        </ul>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
