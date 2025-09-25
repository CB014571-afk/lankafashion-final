import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../pics/logo.jpeg";
import { useAuth } from "../context/AuthContext";
import Notifications from "./Notifications";

const linkStyle = {
  textDecoration: "none",
  fontWeight: "bold",
  color: "#222",
};

const buttonStyle = {
  ...linkStyle,
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

export default function Navbar() {
  // Google Translate widget loader
  React.useEffect(() => {
    // Only load once
    if (!window.googleTranslateScriptLoaded) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
      window.googleTranslateScriptLoaded = true;
      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,si,ta',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      };
    }
  }, []);
  const navigate = useNavigate();
  const { role: ctxRole, token, user: ctxUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch unread notifications count on mount
  React.useEffect(() => {
    async function fetchUnreadCount() {
      try {
        // Get user from context or localStorage
        const user = ctxUser ?? (() => {
          const u = localStorage.getItem("user");
          return u ? JSON.parse(u) : null;
        })();
        if (!user) return;
        // Use the same API as Notifications.jsx
        const API = require("../services/api").default;
        const response = await API.get(`/notifications/${user._id}`);
        const unread = response.data.filter(n => n.read === false);
        setUnreadCount(unread.length);
      } catch (err) {
        // Ignore errors for badge
      }
    }
    fetchUnreadCount();
  }, [ctxUser]);

  // Always get user from context or localStorage
  const role = ctxRole ?? localStorage.getItem("role");
  const user = ctxUser ?? (() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  })();
  const name = user?.name ?? localStorage.getItem("name");

  const updateNotificationCount = (count) => {
    setUnreadCount(count);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#e2b455",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 30px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      {/* Logo + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img 
          src={logo} 
          alt="logo" 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            objectFit: 'cover',
            flexShrink: 0
          }} 
        />
        <span style={{ fontSize: 24, fontWeight: "bold", color: "#222", fontFamily: "Georgia" }}>
          LankaFashion
        </span>
      </div>

      {/* Centered links, notifications, logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Buyer / default menu */}
        {(!role || role === "buyer") && (
          <>
            <Link to="/" style={linkStyle}>Home</Link>
            <Link to="/shop" style={linkStyle}>Shop</Link>
            <Link to="/cart" style={{ ...linkStyle, fontSize: 22 }}>🛒</Link>
            {/* Bell icon for notifications */}
            {token && user && (
              <div style={{ position: "relative", marginRight: 8, display: "inline-block" }}>
                <span
                  style={{ fontSize: 22, cursor: "pointer", position: "relative", display: "inline-block" }}
                  title="Notifications"
                  onClick={() => setShowNotifications((prev) => !prev)}
                >
                  🔔
                  {typeof unreadCount === "number" && unreadCount > 0 && (
                    <span style={{
                      position: "absolute",
                      top: -8,
                      right: -12,
                      background: "#e53935",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      lineHeight: 1,
                      minWidth: 18,
                      textAlign: "center"
                    }}>{unreadCount}</span>
                  )}
                </span>
                {showNotifications && (
                  <div style={{
                    position: "absolute",
                    top: 30,
                    right: 0,
                    zIndex: 100,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    minWidth: 260
                  }}>
                    <Notifications updateNotificationCount={setUnreadCount} />
                  </div>
                )}
              </div>
            )}
            {!token ? (
              <>
                <Link to="/register" style={linkStyle}>Register</Link>
                <Link to="/login" style={linkStyle}>Login</Link>
              </>
            ) : (
              <button onClick={handleLogout} style={buttonStyle}>Logout</button>
            )}
          </>
        )}

        {/* Seller menu */}
        {role === "seller" && (
          <>
            <Link to="/seller" style={linkStyle}>Seller Dashboard</Link>
            <Link to="/seller-orders" style={linkStyle}>Orders</Link>
            <Link to="/preorder" style={linkStyle}>Pre-Order Materials</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        )}

        {/* Supplier menu */}
        {role === "supplier" && (
          <>
            <Link to="/supplier-dashboard" style={linkStyle}>Supplier Dashboard</Link>
            <Link to="/supplier-preorders" style={linkStyle}>PreOrders</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        )}

        {/* Admin (placeholder) */}
        {role === "admin" && (
          <>
            <Link to="/" style={linkStyle}>Admin Dashboard</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        )}

        {/* Driver Dashboard */}
        {role === "driver" && (
          <>
            <Link to="/driver-dashboard" style={linkStyle}>Driver Dashboard</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        )}
      </div>

      {/* Greeting and language selector on the right */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  {token && name && <span style={{ color: "#333" }}>Hi, {name}</span>}
  {/* Google Translate widget */}
  <div id="google_translate_element" style={{ marginLeft: 10 }}></div>
      </div>
    </nav>
  );
}
