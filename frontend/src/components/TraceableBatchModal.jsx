/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2, SendHorizonal, Bot } from "lucide-react";

export default function TraceableBatchModal({ order, onClose, isOpen = true }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I'm your delivery assistant. Ask about your order anytime." },
  ]);
  const [input, setInput] = useState("");

  // Mock route + tracking (for testing until backend)
  const mockTracking = {
    currentLocation: "Nairobi Warehouse",
    lastUpdated: new Date().toISOString(),
    stages: [
      { title: "Order Placed", completed: true, date: "Oct 12, 2025" },
      { title: "Packed", completed: true, date: "Oct 13, 2025" },
      { title: "Shipped", completed: true, date: "Oct 14, 2025" },
      { title: "Out for Delivery", completed: order.status !== "Pending", date: "Oct 15, 2025" },
      { title: "Delivered", completed: order.status === "Delivered", date: "Oct 16, 2025" },
    ],
    route: {
      from: "Nyeri Coffee Farm",
      via: "Nairobi Warehouse",
      to: "Buyer’s Address",
      distance: "155 km",
      eta: "2h 45m",
    },
  };

  useEffect(() => {
    if (!order) return;
    setTimeout(() => {
      setTracking(mockTracking);
      setLoading(false);
    }, 800);
  }, [order]);

  // Chatbot logic
  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { from: "user", text: input };
    setMessages((m) => [...m, newMsg]);
    setTimeout(() => {
      let reply = "🤖 Let me check that for you.";
      if (input.toLowerCase().includes("where"))
        reply = `📍 Your order is currently near ${mockTracking.currentLocation}.`;
      else if (input.toLowerCase().includes("when"))
        reply = `⏱ ETA to destination: ${mockTracking.route.eta}.`;
      else if (input.toLowerCase().includes("route"))
        reply = `🛣 Route: ${mockTracking.route.from} → ${mockTracking.route.via} → ${mockTracking.route.to}.`;
      else if (input.toLowerCase().includes("status"))
        reply = `📦 Current stage: ${mockTracking.stages.find((s) => !s.completed)?.title || "Delivered"}.`;

      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 900);
    setInput("");
  };

  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-[#252525] p-8 rounded-2xl shadow-2xl w-full max-w-3xl relative overflow-hidden"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-[#3B1F0E] dark:hover:text-amber-400"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold text-center text-[#3B1F0E] dark:text-amber-400 mb-6 font-archivo">
            Delivery Progress: {order.product}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin w-8 h-8 text-[#3B1F0E]" />
            </div>
          ) : (
            <>
              <div className="border-l-4 border-[#3B1F0E] dark:border-amber-400 pl-6 mb-8">
                {tracking.stages.map((s, i) => (
                  <div key={i} className="mb-6 relative">
                    <div
                      className={`absolute -left-[1.3rem] w-6 h-6 rounded-full border-2 ${
                        s.completed ? "bg-green-500 border-green-500" : "bg-gray-300 border-gray-400"
                      }`}
                    ></div>
                    <p className={`${s.completed ? "text-green-500" : "text-gray-500"}`}>
                      {s.title}
                    </p>
                    <p className="text-sm text-gray-400">{s.date}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 dark:bg-[#2C2C2C] p-6 rounded-xl mb-6">
                <h3 className="font-bold text-[#3B1F0E] dark:text-amber-400 mb-2">
                  Optimized Route
                </h3>
                <p>🚜 From: {tracking.route.from}</p>
                <p>🏭 Via: {tracking.route.via}</p>
                <p>🏠 To: {tracking.route.to}</p>
                <p>🛣 Distance: {tracking.route.distance}</p>
                <p>⏱ ETA: {tracking.route.eta}</p>
              </div>

              <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-60 flex flex-col items-center justify-center">
                <MapPin className="w-10 h-10 text-gray-500 mb-2" />
                <p className="text-gray-600 dark:text-gray-300">
                  Current location: {tracking.currentLocation}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Last updated {new Date(tracking.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </>
          )}

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen((c) => !c)}
            className="fixed bottom-6 right-6 bg-[#3B1F0E] dark:bg-amber-400 text-white dark:text-[#3B1F0E] p-4 rounded-full shadow-lg hover:scale-105 transition"
          >
            <Bot className="w-6 h-6" />
          </button>

          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="fixed bottom-20 right-6 w-80 bg-white dark:bg-[#2C2C2C] rounded-xl shadow-lg flex flex-col overflow-hidden"
              >
                <div className="p-3 bg-[#3B1F0E] dark:bg-amber-400 text-white dark:text-[#2C2C2C] font-semibold">
                  Delivery Assistant
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-80">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg max-w-[80%] ${
                        msg.from === "bot"
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-800 self-start"
                          : "bg-[#3B1F0E] dark:bg-amber-400 text-white self-end ml-auto"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="flex items-center p-3 border-t border-gray-300 dark:border-gray-700">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask about your delivery..."
                    className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200"
                  />
                  <button onClick={handleSendMessage}>
                    <SendHorizonal className="w-5 h-5 text-[#3B1F0E] dark:text-amber-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
