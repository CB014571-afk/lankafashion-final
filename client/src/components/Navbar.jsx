import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../pics/logo.jpeg";
import { useAuth } from "../context/AuthContext"; // Use the Auth context

export default function Navbar() {
  const navigate = useNavigate();
  const { role, token, logout } = useAuth();

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
      {/* Logo and Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <img
          src={logo}
          alt="logo"
          style={{ width: "40px", height: "40px", borderRadius: "10px" }}
        />
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#222",
            fontFamily: "Georgia",
          }}
        >
          LankaFashion
        </span>
      </div>

      {/* Navigation Links */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          flex: 1,
        }}
      >
        {/* Buyer Menu */}
        {(!role || role === "buyer") && (
          <>
            <Link to="/" style={linkStyle}>Home</Link>
            <Link to="/shop" style={linkStyle}>Shop</Link>
            <Link to="/cart" style={{ ...linkStyle, fontSize: "22px" }}>🛒</Link>
            {!token && (
              <>
                <Link to="/register" style={linkStyle}>Register</Link>
                <Link to="/login" style={linkStyle}>Login</Link>
              </>
            )}
            {token && <button onClick={handleLogout} style={buttonStyle}>Logout</button>}
          </>
        )}

        {/* Seller Menu */}
        {role === "seller" && (
          <>
            <Link to="/my-store" style={linkStyle}>My Store</Link>
            <Link to="/add-product" style={linkStyle}>Add Product</Link>
            <Link to="/seller-orders" style={linkStyle}>Orders</Link>
            <Link to="/preorder" style={linkStyle}>Pre-Order Materials</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        )}

        {/* Admin Menu */}
        {role === "admin" && (
          <>
            <Link to="/admin" style={linkStyle}>Admin Dashboard</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        )}
      </div>

      {/* Language Selector */}
      <div style={{ marginTop: "10px" }}>
        <select
          style={{
            padding: "5px 10px",
            borderRadius: "8px",
            border: "none",
          }}
        >
          <option>English</option>
          <option>සිංහල</option>
          <option>தமிழ்</option>
        </select>
      </div>
    </nav>
  );
}

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
