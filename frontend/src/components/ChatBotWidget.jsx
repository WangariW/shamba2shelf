/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { askGemini } from "../services/geminiService";
import { MessageSquare, X } from "lucide-react";
import { useState, useEffect } from "react";

function TypingDots() {
  return (
    <div className="flex space-x-1 px-3 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-300 animate-bounce"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-200 animate-bounce"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-100 animate-bounce"></span>
    </div>
  );
}

export default function ChatBotWidget({ userRole = "buyer" }) {
  const [open, setOpen] = useState(false);

  const greeting =
    userRole === "farmer"
      ? "👋 Hi Farmer! Ask me anything about improving yield, drying, processing, pricing, or crop management."
      : "👋 Hi Buyer! Need help choosing coffee, understanding flavor notes, or checking product details?";

  const storageKey =
    userRole === "farmer"
      ? "shamba_chat_farmer_history"
      : "shamba_chat_buyer_history";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.warn("Failed to load saved chat:", e);
    }
  }, [storageKey]);

  // Save chat history whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to save chat:", e);
    }
  }, [messages, storageKey]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");

    setIsTyping(true);

    askGemini(input, userRole).then((botReply) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply },
      ]);
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="bg-[#3B1F0E] dark:bg-[#c49a6c] p-4 rounded-full text-white dark:text-[#1f1b18] shadow-lg hover:scale-105 transition"
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </motion.button>

      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-[#0b1120] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-[#020617]">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Shamba2Shelf AI
                </p>
                <p className="text-sm font-semibold text-[#3B1F0E] dark:text-gray-100">
                  {userRole === "farmer" ? "Farmer Assistant" : "Buyer Assistant"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

           
            <div className="p-4 h-80 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 custom-scrollbar">
                {/* Greeting bubble (UI only) */}
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-2xl text-xs sm:text-sm bg-gray-100 dark:bg-[#111827] text-gray-800 dark:text-gray-200 max-w-[90%]">
                    {greeting}
                  </div>
                </div>

                
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "bot" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words ${
                        msg.sender === "bot"
                          ? "bg-gray-200 dark:bg-[#1f2937] text-gray-900 dark:text-gray-100"
                          : "bg-[#0b84ff] text-white dark:bg-[#2563eb]"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                
                {isTyping && (
                  <div className="flex justify-start">
                    <TypingDots />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#020617] text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#3B1F0E] dark:focus:ring-[#c49a6c]"
                />
                <button
                  onClick={handleSend}
                  className="bg-[#3B1F0E] dark:bg-[#c49a6c] text-white dark:text-[#1f1b18] px-3 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
