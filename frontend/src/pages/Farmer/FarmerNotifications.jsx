import React, { useState } from "react";
import { Bell } from "lucide-react";

const FarmerNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Local notification array (temporary)
  const notifications = [
    { id: 1, title: "Low Stock", message: "Robusta beans stock is below 10 units." },
    { id: 2, title: "New Order Received", message: "Order #2043 placed successfully." },
    { id: 3, title: "Batch Delivered", message: "Delivery for order #2038 completed." },
    { id: 4, title: "Inventory Update", message: "Arabica beans restocked." },
  ];

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-800 transition"
      >
        <Bell className="w-6 h-6 text-gray-300" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-72 bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden z-50 animate-fadeIn"
        >
          <div className="p-3 border-b border-gray-800 text-gray-200 font-semibold">
            Notifications
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                >
                  <p className="font-medium text-gray-100">{notif.title}</p>
                  <p className="text-sm text-gray-400">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No new notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerNotifications;
