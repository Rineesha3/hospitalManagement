import { useEffect, useRef, useState } from "react";
import { BiBell } from "react-icons/bi";
import { BASE_URL } from "../../config";
import { formatDate } from "../../utils/formatDate";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) setNotifications(result.data);
    } catch {
      // silently ignore - notifications are non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <BiBell className="w-6 h-6 text-headingColor" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[320px] sm:w-[320px] max-h-[320px] overflow-y-auto bg-white shadow-panelShadow rounded-md z-50">
          <h4 className="px-4 py-2 flex items-center justify-between text-[14px] leading-tight font-bold text-headingColor border-b border-solid border-[#0066ff1c]">
            Notifications
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-normal text-primaryColor hover:underline"
              >
                Mark all as read
              </button>
            )}
          </h4>
          {notifications.length === 0 && (
            <p className="px-4 py-3 text-textColor text-[14px]">No notifications yet</p>
          )}
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`px-4 py-2 border-b border-solid border-[#0066ff1c] cursor-pointer leading-tight ${
                n.isRead ? "bg-white" : "bg-indigo-50"
              }`}
            >
              <p className="text-[13px] text-headingColor">
                {n.message}{" "}
                <span className="text-[11px] text-textColor whitespace-nowrap">
                  · {formatDate(n.createdAt)}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
