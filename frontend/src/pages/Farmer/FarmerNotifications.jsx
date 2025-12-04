import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

const FarmerNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Temporary local notifications
  const notifications = [
    { id: 1, title: "Low Stock", message: "Robusta beans stock is below 10 units.", unread: true },
    { id: 2, title: "New Order Received", message: "Order #2043 placed successfully.", unread: true },
    { id: 3, title: "Batch Delivered", message: "Delivery for order #2038 completed.", unread: false },
    { id: 4, title: "Inventory Update", message: "Arabica beans restocked.", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] transition"
      >
        <Bell className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3a322b] rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-[#3a322b] flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-200 dark:border-[#3a322b] hover:bg-gray-50 dark:hover:bg-[#2a2520] cursor-pointer transition ${
                    notif.unread ? 'bg-amber-50 dark:bg-[#2a2520]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notif.message}
                      </p>
                    </div>
                    
                    {/* Unread indicator */}
                    {notif.unread && (
                      <span className="ml-2 h-2 w-2 bg-amber-500 rounded-full flex-shrink-0 mt-2"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-[#3a322b] bg-gray-50 dark:bg-[#2a2520]">
              <button className="text-sm text-[#3B1F0E] dark:text-amber-400 hover:underline w-full text-center">
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerNotifications;