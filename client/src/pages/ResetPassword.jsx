import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("Reset failed. Invalid or expired token.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", padding: "30px", backgroundColor: "#fff4eb", borderRadius: "10px" }}>
      <h2 style={{ color: "#cc6600", textAlign: "center" }}>Reset Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px" }}
        />
        <button type="submit" style={{ backgroundColor: "#cc6600", color: "#fff", padding: "10px", width: "100%", borderRadius: "5px" }}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
