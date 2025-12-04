/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Trash2, Package, CheckCircle, Clock, XCircle } from "lucide-react";

const getNotificationIcon = (type) => {
  switch (type) {
    case 'order_delivered':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'order_shipped':
      return <Package className="w-4 h-4 text-blue-500" />;
    case 'order_pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'order_cancelled':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Package className="w-4 h-4 text-gray-500" />;
  }
};

const formatTime = (date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationsPanel({ notifications = [], onClearAll, onMarkRead, onDelete }) {
  return (
    <motion.div
      className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#1f1f1f]">
        <h3 className="font-semibold text-[#3B1F0E] dark:text-amber-400">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <ul className="max-h-96 overflow-y-auto">
          {notifications.map((note) => (
            <motion.li
              key={note.id}
              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition group ${
                note.read ? "opacity-60" : ""
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getNotificationIcon(note.type)}
                </div>
                
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onMarkRead(note.id)}>
                  <p className={`text-sm ${note.read ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                    {note.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(note.timestamp)}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {!note.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
        </div>
      )}
    </motion.div>
  );
}