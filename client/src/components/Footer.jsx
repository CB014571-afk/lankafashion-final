import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#fff4e6", // lighter background
        color: "#333", // darker text
        padding: "20px",
        textAlign: "center",
        marginTop: "40px",
        borderTop: "1px solid #ccc",
      }}
    >
      <p style={{ margin: "5px 0", fontWeight: "bold" }}>
        © {new Date().getFullYear()} LankaFashion. All rights reserved.
      </p>
      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        <Link to="/shop" style={{ color: "#cc6600", margin: "0 10px", textDecoration: "none" }}>
          Shop
        </Link>
        |
        <Link to="/register" style={{ color: "#cc6600", margin: "0 10px", textDecoration: "none" }}>
          Register
        </Link>
        |
        <Link to="/login" style={{ color: "#cc6600", margin: "0 10px", textDecoration: "none" }}>
          Login
        </Link>
      </div>
    </footer>
  );
}
