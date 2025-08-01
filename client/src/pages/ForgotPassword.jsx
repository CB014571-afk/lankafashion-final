import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Error sending reset email.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", padding: "30px", backgroundColor: "#fff4eb", borderRadius: "10px" }}>
      <h2 style={{ color: "#cc6600", textAlign: "center" }}>Forgot Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "5px" }}
        />
        <button type="submit" style={{ backgroundColor: "#cc6600", color: "#fff", padding: "10px", width: "100%", borderRadius: "5px" }}>
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
