import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
  const res = await API.post("/users/login", { email, password });
      const { token, user } = res.data;
      login(token, user.role, user);
      if (user.role === "seller") {
        navigate("/seller");
      } else if (user.role === "supplier") {
        navigate("/supplier-dashboard");
      } else if (user.role === "admin") {
        navigate("/");
      } else if (user.role === "driver") {
        navigate("/driver-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    }
  };

  const containerStyle = {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "30px",
    backgroundColor: "#fff4eb",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "15px",
    backgroundColor: "#cc6600",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const linkStyle = {
    display: "block",
    textAlign: "right",
    marginTop: "10px",
    fontSize: "14px",
    color: "#cc6600",
    textDecoration: "underline",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", color: "#cc6600" }}>Login</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" style={buttonStyle}>Login</button>
        <Link to="/forgot-password" style={linkStyle}>Forgot Password?</Link>
      </form>
    </div>
  );
}
