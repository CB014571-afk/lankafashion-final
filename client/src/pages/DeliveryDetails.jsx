import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StatusUpdate from "../components/StatusUpdate";
import ProofOfDelivery from "../components/ProofOfDelivery";
import Notifications from "../components/Notifications";

export default function DeliveryDetails() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Fetch delivery details by ID from API
    setDelivery({
      id,
      item: "Package A",
      pickup: "Warehouse X",
      dropoff: "Customer Y",
      payment: "Cash on Delivery",
      status: "pending",
    });
    setStatus("pending");
  }, [id]);

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);
    // Send status update to API with timestamp
    console.log(`Delivery ${id} updated to ${newStatus}`);
  };

  const handleProofUpload = (file) => {
    console.log(`Proof uploaded for delivery ${id}: ${file.name}`);
    // Upload file to API here
  };

  if (!delivery) return <p>Loading...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Delivery Details</h1>
      <p><strong>Item:</strong> {delivery.item}</p>
      <p><strong>Pickup:</strong> {delivery.pickup}</p>
      <p><strong>Dropoff:</strong> {delivery.dropoff}</p>
      <p><strong>Payment:</strong> {delivery.payment}</p>
      <p><strong>Status:</strong> {status}</p>

      {/* Status Update Component */}
      <StatusUpdate
        deliveryId={delivery.id}
        currentStatus={status}
        onUpdate={handleStatusUpdate}
      />

      {/* Proof Popup */}
      {showPopup && (
        <ProofPopup
          onClose={() => setShowPopup(false)}
          onSubmit={handleProofSubmit}
      />)}

      {/* Notifications */}
      <Notifications />
    </div>
  );
}
