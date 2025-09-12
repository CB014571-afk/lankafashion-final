
import React from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

// ✅ Add onProofClick to props
export default function DeliveryCard({ delivery, onStatusUpdate, onProofClick }) {
  const handleAccept = async () => {
    try {
  await API.put(`/delivery/${delivery._id}/status`, {
        status: "in-progress"
      });
      onStatusUpdate();
    } catch (err) {
      console.error("Failed to accept delivery:", err);
      alert("Failed to update delivery status");
    }
  };

  const handleComplete = async () => {
    try {
  await API.put(`/delivery/${delivery._id}/status`, {
        status: "completed"
      });
      onStatusUpdate();
    } catch (err) {
      console.error("Failed to complete delivery:", err);
      alert("Failed to update delivery status");
    }
  };

  const getStatusColor = () => {
    switch (delivery.status) {
      case "pending": return "#FFA500";
      case "in-progress": return "#0000FF";
      case "completed": return "#008000";
      default: return "#000000";
    }
  };

  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "1rem",
      margin: "1rem 0",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem"
      }}>
        <h3 style={{ margin: 0 }}>Delivery #{delivery._id.slice(-4)}</h3>
        <span style={{
          color: getStatusColor(),
          fontWeight: "bold"
        }}>
          {delivery.status?.toUpperCase()}
        </span>
      </div>
      <p><strong>Name:</strong> {delivery.name}</p>
      <p><strong>Address:</strong> {delivery.address}</p>
      <p><strong>Email:</strong> {delivery.email}</p>
      <p><strong>Contact Number:</strong> {delivery.phone}</p>
      <p><strong>Payment:</strong> {delivery.paymentMethod}</p>
      <p><strong>Total Amount:</strong> Rs. {delivery.total}</p>

      <div style={{
        display: "flex",
        gap: "10px",
        marginTop: "1rem",
        justifyContent: "flex-end",
        flexWrap: "wrap"
      }}>
        {delivery.status === "pending" && (
          <button
            onClick={handleAccept}
            style={{
              background: "#4CAF50",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Accept Delivery
          </button>
        )}
        {delivery.status === "in-progress" && (
          <button
            onClick={handleComplete}
            style={{
              background: "#2196F3",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Mark as Done
          </button>
        )}
        {delivery.status === "completed" && !delivery.proofUrl && (
          <button
            onClick={() => onProofClick(delivery)}
            style={{
              background: "green",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Upload Proof
          </button>
        )}
      </div>

      {/* Show submitted proof image if available */}
      {delivery.proofUrl && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Submitted Proof</h4>
          <img src={delivery.proofUrl} alt="Proof of Delivery" style={{ maxWidth: 200, maxHeight: 200, display: "block" }} />
        </div>
      )}
    </div>
  );
}