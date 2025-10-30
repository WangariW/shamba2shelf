/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function NotificationsPanel({ notifications = [], onClearAll, onMarkRead }) {
  return (
    <motion.div
      className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-[#3B1F0E] dark:text-amber-400">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <ul className="max-h-64 overflow-y-auto">
          {notifications.map((note) => (
            <motion.li
              key={note.id}
              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition ${
                note.read ? "text-gray-400" : "text-gray-800 dark:text-gray-200"
              }`}
              onClick={() => onMarkRead(note.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {note.message}
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
          No new notifications
        </div>
      )}
    </motion.div>
  );
}
