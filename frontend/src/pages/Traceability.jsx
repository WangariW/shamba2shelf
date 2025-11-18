/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Bot, SendHorizonal } from "lucide-react";

const mockTraceData = {
  "NY-ARB-0425": {
    productName: "Nyeri Arabica Beans",
    productType: "Coffee Beans",
    roastLevel: "Medium Roast",
    origin: "Nyeri County, Kenya",
    harvestDate: "April 2025",
    batchId: "NY-ARB-0425",
    farmer: {
      name: "Mwangi Kamau",
      farmName: "Green Highlands Estate",
      story:
        "Mwangi Kamau is a second-generation farmer from Nyeri who believes in sustainable coffee growing.",
      photo: "/src/assets/images/farmer-2.jpg",
    },
    route: {
      from: "Nyeri Coffee Farm",
      via: "Shamba2Shelf Facility, Nairobi",
      to: "Shamba2Shelf Marketplace",
      distance: "155 km",
      eta: "3 hours 10 minutes",
    },
    steps: [
      { stage: "Harvested", date: "Apr 10, 2025", location: "Nyeri, Kenya" },
      { stage: "Processed", date: "Apr 13, 2025", location: "Karatina Mills" },
      { stage: "Roasted", date: "Apr 16, 2025", location: "Shamba2Shelf Facility, Nairobi" },
      { stage: "Packaged", date: "Apr 17, 2025", location: "Nairobi, Kenya" },
      { stage: "Delivered", date: "Apr 20, 2025", location: "Shamba2Shelf Marketplace" },
    ],
  },
};

export default function Traceability() {
  const { batchId } = useParams();
  const traceData = mockTraceData[batchId];
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "☕ Hi there! Ask me about this coffee’s journey or farmer." },
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { from: "user", text: input };
    setMessages((m) => [...m, newMsg]);
    setTimeout(() => {
      let reply = "🤖 Let me find that info for you.";
      if (input.toLowerCase().includes("origin"))
        reply = `🌍 This batch was grown in ${traceData.origin}.`;
      else if (input.toLowerCase().includes("farmer"))
        reply = `👨‍🌾 Farmer: ${traceData.farmer.name} from ${traceData.farmer.farmName}.`;
      else if (input.toLowerCase().includes("route"))
        reply = `🛣 Route: ${traceData.route.from} → ${traceData.route.via} → ${traceData.route.to}.`;
      else if (input.toLowerCase().includes("eta"))
        reply = `⏱ ETA: ${traceData.route.eta}.`;
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 900);
    setInput("");
  };

  if (!traceData) return <p className="text-center py-20">Batch not found.</p>;

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#1E1E1E] text-gray-900 dark:text-gray-100 transition">
      <section className="bg-[#3B1F0E] dark:bg-[#2A140A] text-white py-12 text-center">
        <h1 className="text-4xl font-bold font-archivo">Product Traceability</h1>
        <p className="text-gray-300 mt-2">Transparency from farm to cup</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          className="bg-white dark:bg-[#2C2C2C] rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4">
            {traceData.productName}
          </h2>
          <p>Type: {traceData.productType}</p>
          <p>Roast Level: {traceData.roastLevel}</p>
          <p>Origin: {traceData.origin}</p>
          <p>Harvest Date: {traceData.harvestDate}</p>
          <p>Batch ID: {traceData.batchId}</p>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <h3 className="text-3xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-6 text-center">
          Farm to Cup Journey
        </h3>
        <div className="border-l-4 border-[#3B1F0E] dark:border-amber-400 ml-8">
          {traceData.steps.map((s, i) => (
            <div key={i} className="mb-6 ml-6">
              <div className="absolute -left-4 w-8 h-8 bg-[#3B1F0E] dark:bg-amber-400 rounded-full border-4 border-white"></div>
              <h4 className="text-xl font-semibold">{s.stage}</h4>
              <p>{s.date}</p>
              <p className="italic text-gray-500">{s.location}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-4">
            Optimized Route
          </h3>
          <p>🚜 From: {traceData.route.from}</p>
          <p>🏭 Via: {traceData.route.via}</p>
          <p>🏠 To: {traceData.route.to}</p>
          <p>🛣 Distance: {traceData.route.distance}</p>
          <p>⏱ ETA: {traceData.route.eta}</p>
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg mt-6 h-64 flex flex-col items-center justify-center">
            <MapPin className="w-10 h-10 text-gray-600 dark:text-gray-300 mb-2" />
            <p className="text-gray-600 dark:text-gray-300">Route visualization coming soon...</p>
          </div>
        </div>
      </section>

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
              Traceability Assistant
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-80">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[80%] ${
                    m.from === "bot"
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-800"
                      : "bg-[#3B1F0E] dark:bg-amber-400 text-white ml-auto"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex items-center p-3 border-t border-gray-300 dark:border-gray-700">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about this batch..."
                className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200"
              />
              <button onClick={handleSendMessage}>
                <SendHorizonal className="w-5 h-5 text-[#3B1F0E] dark:text-amber-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
