import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PreOrderRequest() {
  const [materialName, setMaterialName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [paymentOption, setPaymentOption] = useState("pay_now");
  const [payLaterDueDate, setPayLaterDueDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [restricted, setRestricted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const user = JSON.parse(localStorage.getItem("user"));
    if (role !== "seller") {
      alert("Access denied. Only sellers can use this page.");
      navigate("/");
      return;
    }
    // Check for overdue restriction
    if (user?._id) {
      API.get(`/api/preorder/overdue/${user._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(res => {
          setRestricted(res.data.restricted);
        })
        .catch(() => setRestricted(false));
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Restriction check
    if (restricted) {
      setError("You are restricted from making new preorders due to overdue payments.");
      return;
    }
    // Validate pay later due date
    if (paymentOption === "pay_later" && payLaterDueDate) {
      const today = new Date();
      const due = new Date(payLaterDueDate);
      const maxDue = new Date();
      maxDue.setMonth(maxDue.getMonth() + 1);
      if (due < today) {
        setError("Payment due date cannot be in the past.");
        return;
      }
      if (due > maxDue) {
        setError("Payment due date must be within one month from today.");
        return;
      }
    }
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/preorder/submit",
        {
          materialName,
          email,
          contactNumber,
          quantity,
          preferredDate,
          paymentOption,
          paymentDueDate: payLaterDueDate || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Preorder request submitted!");
      setTimeout(() => navigate("/seller"), 1500);
      setMaterialName("");
      setEmail("");
      setContactNumber("");
      setQuantity("");
      setPreferredDate("");
      setPaymentOption("pay_now");
      setPayLaterDueDate("");
    } catch (err) {
      setError("Error submitting preorder request.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 30, background: "#fff4eb", borderRadius: 10 }}>
      <h2 style={{ textAlign: "center", color: "#cc6600" }}>PreOrder Request</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
      {restricted && (
        <div style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          You are restricted from making new preorders due to overdue payments.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "bold" }}>
            Material Name:
          </label>
          <input
            type="text"
            placeholder="Enter material name (e.g., Cotton Fabric, Silk, Denim)"
            value={materialName}
            onChange={e => setMaterialName(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          />
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
            Specify the exact material you need
          </small>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "bold" }}>
            Contact Email:
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          />
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
            Supplier will use this email to contact you
          </small>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "bold" }}>
            Contact Number:
          </label>
          <input
            type="tel"
            placeholder="Enter your contact number"
            value={contactNumber}
            onChange={e => setContactNumber(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          />
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
            Provide a valid contact number for supplier communication
          </small>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "bold" }}>
            Quantity:
          </label>
          <input
            type="text"
            placeholder="e.g., 50 meters, 100 kg, 200 pieces"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          />
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
            Always include the unit of measurement (meters, kg, pieces, etc.)
          </small>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "bold" }}>
            Preferred Delivery Date:
          </label>
          <input
            type="date"
            value={preferredDate}
            onChange={e => setPreferredDate(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          />
          <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
            Select your desired delivery date (subject to supplier confirmation)
          </small>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "bold" }}>
            Payment Option:
          </label>
          <select
            value={paymentOption}
            onChange={e => setPaymentOption(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
          >
            <option value="pay_now">Pay Now</option>
            <option value="pay_later">Pay Later</option>
          </select>
          {paymentOption === "pay_later" && (
            <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fff0e6", borderRadius: "5px" }}>
              <strong style={{ color: "#cc6600", fontSize: "14px" }}>Important Payment Terms:</strong>
              <ul style={{ marginTop: "5px" }}>
                <li>Payment must be completed within 1 month of supplier acceptance</li>
                <li>Late payments will result in restriction from making new requests</li>
                <li>Early payment may improve your buyer reputation</li>
              </ul>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          style={{ 
            width: "100%", 
            padding: "12px", 
            marginTop: 15, 
            background: "#cc6600", 
            color: "white", 
            border: "none", 
            borderRadius: 5, 
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          Submit Pre-Order Request
        </button>
      </form>
    </div>
  );
}
