import React, { useState } from "react";

export default function StatusUpdate({ deliveryId, currentStatus, onUpdate }) {
  const [status, setStatus] = useState(currentStatus);

  const handleClick = (newStatus) => {
    setStatus(newStatus);
    // Call parent callback to update status in API or parent state
    onUpdate(deliveryId, newStatus);
  };

  const statuses = ["picked up", "on the way", "delivered", "failed"];

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Update Status</h3>
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => handleClick(s)}
          style={{
            margin: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: s === status ? "#4caf50" : "#ddd",
            color: s === status ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
