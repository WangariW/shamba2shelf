/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { X, MapPin } from "lucide-react";

export default function TraceableBatchModal({ order, onClose }) {
  // Mock delivery stages
  const stages = [
    { id: 1, title: "Order Placed", completed: true, date: "Oct 12, 2025" },
    { id: 2, title: "Packed", completed: true, date: "Oct 13, 2025" },
    { id: 3, title: "Shipped", completed: order.status !== "Pending", date: "Oct 14, 2025" },
    { id: 4, title: "Out for Delivery", completed: order.status === "Delivered", date: "Oct 15, 2025" },
    { id: 5, title: "Delivered", completed: order.status === "Delivered", date: order.status === "Delivered" ? "Oct 15, 2025" : null },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        className="bg-white dark:bg-[#252525] p-8 rounded-xl shadow-lg w-full max-w-2xl relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-[#3B1F0E] dark:text-amber-400 mb-6 text-center">
          Delivery Progress: {order.product}
        </h2>

        {/* Timeline */}
        <div className="flex flex-col space-y-4 mb-6">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center">
              <div className="flex flex-col items-center mr-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 ${
                    stage.completed ? "bg-green-500 border-green-500" : "bg-gray-300 border-gray-400"
                  }`}
                ></div>
                {idx !== stages.length - 1 && <div className="w-1 h-full bg-gray-300 dark:bg-gray-600"></div>}
              </div>
              <div>
                <p className={`font-medium ${stage.completed ? "text-green-500" : "text-gray-500 dark:text-gray-400"}`}>
                  {stage.title}
                </p>
                {stage.date && <p className="text-sm text-gray-500 dark:text-gray-400">{stage.date}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
          <MapPin className="w-12 h-12 text-gray-500 dark:text-gray-300" />
          <p className="ml-2 text-gray-500 dark:text-gray-300">Map Placeholder (Route Integration Coming Soon)</p>
        </div>
      </motion.div>
    </div>
  );
}
