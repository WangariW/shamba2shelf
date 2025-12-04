/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Bell } from "lucide-react";
import TraceableBatchModal from "../../components/TraceableBatchModal";
import ChatBotWidget from "../../components/ChatBotWidget";
import DeliveryRouteMap from "../../components/DeliveryRouteMap";
import NotificationsPanel from "../../components/NotificationsPanel";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";


export default function BuyerDashboard() {
  const { user: authUser, logout } = useAuth?.() || {};
  const [buyer, setBuyer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [searchOrder, setSearchOrder] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [buyerLocation, setBuyerLocation] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      setError("");
      try {
        const buyerRes = await api.get("/buyers/me").catch((err) => {
          if (authUser?.id) {
            return api.get(`/buyers/${authUser.id}`);
          }
          return Promise.reject(new Error("No buyer endpoint"));
        });

        if (!mounted) return;
        const buyerData = buyerRes?.data?.data || buyerRes?.data || null;
        setBuyer(buyerData || null);

        const buyerId = buyerData?._id || buyerData?.id || authUser?._id || authUser?.id;
        
        if (buyerId) {
          try {
            const ordersRes = await api.get(`/buyers/${buyerId}/orders`);
            const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.data || [];
            setOrders(ordersData);
            
            const spendingData = calculateSpendingFromOrders(ordersData);
            setSalesData(spendingData);
          } catch (err) {
            console.error("Failed to fetch orders:", err);
            setOrders([]);
            setSalesData(defaultSalesData());
          }
        } else {
          setOrders([]);
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
    if (!navigator.geolocation){
      console.warn("Geolocation not supported");
       return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => { setBuyerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    },
      (err) => {
        console.warn("GPS error:", err);

        //incase GPS fails
        setBuyerLocation({ lat: -1.2921, lng: 36.8219 });//Nairobi coords
        
        if (err.code === 1) {
          console.warn("Permission denied for geolocation.");
        } else if (err.code === 2) {
          console.warn("Position unavailable.");
        } else if (err.code === 3) {
          console.warn("Geolocation timeout.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  // Generate notifications from orders
  useEffect(() => {
    if (orders.length > 0) {
      const notifs = orders
        .filter(order => {
          // Create notifications for recent orders (last 7 days)
          const orderDate = new Date(order.createdAt);
          const daysSince = (Date.now() - orderDate) / (1000 * 60 * 60 * 24);
          return daysSince <= 7;
        })
        .map(order => {
          let type = 'order_pending';
          let message = '';

          switch (order.status) {
            case 'Delivered':
              type = 'order_delivered';
              message = `Your order of ${order.productId?.name} has been delivered!`;
              break;
            case 'InTransit':
              type = 'order_shipped';
              message = `Your order of ${order.productId?.name} is on the way`;
              break;
            case 'Pending':
              type = 'order_pending';
              message = `Order ${order._id.slice(-8)} is awaiting confirmation`;
              break;
            case 'Cancelled':
              type = 'order_cancelled';
              message = `Order ${order._id.slice(-8)} has been cancelled`;
              break;
            default:
              message = `Update on order ${order._id.slice(-8)}`;
          }

          return {
            id: order._id,
            type,
            message,
            timestamp: order.createdAt,
            read: false,
            orderId: order._id
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(notifs);
    }
  }, [orders]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handlePlanRoute = async () => {
    if (!buyerLocation) {
      setRouteError("Buyer location not available.");
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

  // Notification handlers
  const handleMarkRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) => {
        const productName = o.productId?.name || '';
        const matchesSearch = productName.toLowerCase().includes(searchOrder.toLowerCase());
        const matchesStatus = filterStatus === "All" || o.status === filterStatus;
        return matchesSearch && matchesStatus;
      }
    );
  }, [orders, searchOrder, filterStatus]);

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
        
        <div className="flex items-center gap-3">
        <div className="relative notifications-container">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] transition"
          >
            <Bell className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationsPanel
              notifications={notifications}
              onClearAll={handleClearAll}
              onMarkRead={handleMarkRead}
              onDelete={handleDeleteNotification}
            />
          )}
        </div>

        <button
            onClick={logout}
            className="px-4 py-2 bg-[#3B1F0E] dark:bg-amber-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Logout
          </button>
          </div>
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
            <option>InTransit</option>
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
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, i) => (
                  <motion.tr 
                    key={o._id || i} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }} 
                    className="border-b dark:border-gray-700"
                  >
                    <td className="py-3">{o._id ? o._id.slice(-8) : '-'}</td>
                    <td>{o.productId?.name || 'N/A'}</td>
                    <td>{o.quantity} kg</td>
                    <td>KSh {o.totalAmount?.toLocaleString()}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        o.status === 'InTransit' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {o.status}
                      </span>
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
          {buyerLocation ? (
            routeResult ? (
              <DeliveryRouteMap farmers={routeResult.farmers} buyer={routeResult.buyer} routeOrder={routeResult.routeOrder} />
          ) : (
            <DeliveryRouteMap initialLocation={buyerLocation} locationType="buyer"/>
          )
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Getting your location…</p>
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

function calculateSpendingFromOrders(orders) {
  if (!Array.isArray(orders) || orders.length === 0) return defaultSalesData();
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const byMonth = months.map((m) => ({ month: m, spent: 0 }));
  
  orders.forEach((order) => {
    const orderDate = new Date(order.date || order.createdAt || order.orderDate);
    
    if (orderDate.getFullYear() === currentYear) {
      const monthIndex = orderDate.getMonth();
      const amount = Number(order.totalAmount || order.total || order.amount || 0);
      byMonth[monthIndex].spent += amount;
    }
  });
  
  const currentMonth = new Date().getMonth();
  const startMonth = Math.max(0, currentMonth - 5);
  return byMonth.slice(startMonth, currentMonth + 1);
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