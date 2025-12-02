/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
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
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const { user: authUser } = useAuth?.() || {};
  const [buyer, setBuyer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    const token = localStorage.getItem("accessToken");
    console.log("🔑 Token check:", token ? "Token exists" : "No token found");

    if (!token) {
      console.log("❌ No token, redirecting to login");
      navigate("/login");
      return;
    }

    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("📡 Making API call to /buyers/me");
        const buyerRes = await api.get("/buyers/me").catch((err) => {
        console.log("❌ /buyers/me failed:", err.message);
          if (authUser?.id){
            console.log("🔄 Trying fallback /buyers/" + authUser.id);
            return api.get(`/buyers/${authUser.id}`);
          }
          return Promise.reject(new Error("No buyer endpoint"));
        });

        console.log("✅ Buyer data received:", buyerRes?.data);


        if (!mounted) return;
        const buyerData = buyerRes?.data?.data || buyerRes?.data || null;
        setBuyer(buyerData || null);

        const buyerId = buyerData?.id || authUser?.id;
        const ordersPromise = buyerId ? api.get(`/buyers/${buyerId}/orders`) : Promise.resolve({ data: [] });
        const savedPromise = buyerId ? api.get(`/buyers/${buyerId}/saved`) : Promise.resolve({ data: [] });
        const spendingPromise = buyerId ? api.get(`/buyers/${buyerId}/spending`) : Promise.resolve({ data: [] });

        const [ordersRes, savedRes, spendingRes] = await Promise.allSettled([ordersPromise, savedPromise, spendingPromise]);

        if (ordersRes.status === "fulfilled") {
          setOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : ordersRes.value.data.data || []);
        } else {
          setOrders([]);
        }

        if (savedRes.status === "fulfilled") {
          setSavedProducts(Array.isArray(savedRes.value.data) ? savedRes.value.data : savedRes.value.data.data || []);
        } else {
          setSavedProducts([]);
        }

        if (spendingRes.status === "fulfilled") {
          const raw = Array.isArray(spendingRes.value.data) ? spendingRes.value.data : spendingRes.value.data.data || [];
          setSalesData(normalizeSpending(raw));
        } else {
          setSalesData(defaultSalesData());
        }
      } catch (err) {
        setError("Unable to load dashboard data.");
        console.error("Dashboard load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAll();
    return () => { mounted = false; };
  }, [authUser, navigate]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setBuyerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.warn("GPS error:", err);
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
      setRouteResult({ ...res.data, buyer: buyerLocation });
    } catch (err) {
      console.error(err);
      setRouteError("Failed to optimize route. Try again.");
    } finally {
      setRouteLoading(false);
    }
  };

  const removeSaved = async (id) => {
    try {
      await api.delete(`/buyers/${buyer?.id}/saved/${id}`);
      setSavedProducts((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Failed to remove saved product:", err);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.product || "").toLowerCase().includes(searchOrder.toLowerCase()) &&
        (filterStatus === "All" || o.status === filterStatus)
    );
  }, [orders, searchOrder, filterStatus]);

  const filteredSaved = useMemo(() => {
    return savedProducts.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(searchSaved.toLowerCase()) &&
        (filterType === "All" || p.type === filterType)
    );
  }, [savedProducts, searchSaved, filterType]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1B1B1B]">
        <p className="text-[#3B1F0E] dark:text-amber-400 text-lg font-medium">Loading dashboard...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 py-10 px-6 md:px-16 transition-colors duration-300">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-[#3B1F0E] dark:text-amber-400">
          Welcome, {buyer?.name || authUser?.name || "Buyer"}!
        </h1>
        <button className="relative p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 transition">
          <Bell className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full"></span>
        </button>
      </div>

      <motion.div className="flex items-center bg-gray-50 dark:bg-[#252525] p-6 rounded-xl shadow-lg mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden mr-6">
          {buyer?.avatar ? <img src={buyer.avatar} alt="Avatar" /> : <div className="w-full h-full flex items-center justify-center text-xl">JD</div>}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400">{buyer?.name || authUser?.name || "Buyer"}</h2>
          <p className="text-gray-600 dark:text-gray-400">{buyer?.email || authUser?.email}</p>
        </div>
      </motion.div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4">My Orders</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <input placeholder="Search orders..." value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] flex-grow" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 rounded-lg bg-gray-100 dark:bg-[#333]">
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
                  <motion.tr key={o.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b dark:border-gray-700">
                    <td className="py-3">{o.id}</td>
                    <td>{o.product}</td>
                    <td>{formatDate(o.date)}</td>
                    <td>{o.status}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4">Saved Products</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <input placeholder="Search saved..." value={searchSaved} onChange={(e) => setSearchSaved(e.target.value)} className="p-2 rounded-lg bg-gray-100 dark:bg-[#333] flex-grow" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 rounded-lg bg-gray-100 dark:bg-[#333]">
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
                  <motion.tr key={p.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b dark:border-gray-700">
                    <td className="py-3">{p.name}</td>
                    <td>{p.type}</td>
                    <td>
                      <button onClick={() => removeSaved(p.id)} className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-2">
                        <Trash className="w-4 h-4" /> Remove
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <motion.div className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-center text-[#3B1F0E] dark:text-amber-400 mb-6">Monthly Spending Overview</h2>
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

      <motion.div className="bg-gray-50 dark:bg-[#252525] p-8 rounded-xl shadow-lg mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-center text-[#3B1F0E] dark:text-amber-400 mb-6">Route Optimization</h2>

        <div className="w-full h-64 bg-gray-200 dark:bg-[#333] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
          {buyerLocation && routeResult ? (
            <DeliveryRouteMap farmers={routeResult.farmers} buyer={routeResult.buyer} routeOrder={routeResult.routeOrder} />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">{buyerLocation ? "Click Plan Route" : "Getting your location…"}</p>
          )}
        </div>

        {routeResult && (
          <div className="text-center text-sm text-gray-700 dark:text-gray-300 mb-4">
            <p>
              Distance: <span className="font-semibold">{(routeResult.bestRoute.totalDistance / 1000).toFixed(1)} km</span>
            </p>
            <p>
              Estimated Time: <span className="font-semibold">{(routeResult.bestRoute.totalDuration / 60).toFixed(1)} mins</span>
            </p>
          </div>
        )}

        {routeError && <p className="text-red-500 text-center">{routeError}</p>}

        <div className="text-center">
          <button onClick={handlePlanRoute} disabled={routeLoading} className="px-5 py-2 bg-[#3B1F0E] dark:bg-amber-600 text-white rounded-lg hover:opacity-90 disabled:opacity-60 transition">
            {routeLoading ? "Planning Route…" : "Plan Route"}
          </button>
        </div>
      </motion.div>

      <ChatBotWidget userRole="buyer" />

      {showBatchModal && selectedOrder && <TraceableBatchModal order={selectedOrder} onClose={() => setShowBatchModal(false)} />}

      {error && <p className="text-red-500 mt-6 text-center">{error}</p>}
    </div>
  );
}

function normalizeSpending(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return defaultSalesData();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const byMonth = months.map((m) => ({ month: m, spent: 0 }));
  raw.forEach((r) => {
    const d = new Date(r.date || r.month || Date.now());
    const key = months[d.getMonth()];
    const idx = months.indexOf(key);
    if (idx >= 0) byMonth[idx].spent += Number(r.amount || r.spent || 0);
  });
  return byMonth.slice(0, 6);
}

function defaultSalesData() {
  return [
    { month: "Jan", spent: 120 },
    { month: "Feb", spent: 200 },
    { month: "Mar", spent: 150 },
    { month: "Apr", spent: 180 },
    { month: "May", spent: 220 },
    { month: "Jun", spent: 170 },
  ];
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
