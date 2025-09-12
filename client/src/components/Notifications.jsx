import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import "./Notifications.css";

export default function Notifications({ updateNotificationCount }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
  const response = await API.get(`/api/notifications/${user._id}`);
      setNotifications(response.data);
      // Count only unread notifications
      const unread = response.data.filter(n => n.read === false);
      if (updateNotificationCount) {
        updateNotificationCount(unread.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/notifications/${id}`);
      const updatedNotifications = notifications.filter(n => n._id !== id);
      setNotifications(updatedNotifications);
      // Count only unread notifications
      const unread = updatedNotifications.filter(n => n.read === false);
      if (updateNotificationCount) {
        updateNotificationCount(unread.length);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (!user) return null;

  // Only show unread notifications
  const unreadNotifications = notifications.filter(n => n.read === false);
  return (
    <div className="notifications-container">
      <h3>Notifications</h3>
      {unreadNotifications.length === 0 ? (
        <div className="no-notifications">No unread notifications</div>
      ) : (
        <ul className="notifications-list">
          {unreadNotifications.map(n => {
            // Replace full order ID in message with short version if present
            let msg = n.message;
            // Try to match both 24-char and 6-char order IDs
            const idMatch = msg.match(/order ([a-f0-9]{24})/i);
            if (idMatch) {
              const fullId = idMatch[1];
              const shortId = fullId.slice(-6);
              // Replace any order ID (24, 6, or 4 chars) after 'order ' with shortId
              msg = msg.replace(/order ([a-f0-9]{4,24})/i, `order ${shortId}`);
            }
            return (
              <li key={n._id} className="notification-item">
                <span className="notification-message">{msg}</span>
                <button 
                  onClick={() => handleDelete(n._id)}
                  className="ok-button"
                >
                  OK
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
