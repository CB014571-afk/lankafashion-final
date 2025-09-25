import React, { useState, useEffect } from "react";
import API from "../services/api";
import DeliveryCard from "../components/DeliveryCard";
import ProofPopup from "./ProofPopUP"; // ✅ Added

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [showPopup, setShowPopup] = useState(false); // ✅ Added
  const [selectedDelivery, setSelectedDelivery] = useState(null); // ✅ Added

  const fetchDeliveries = async () => {
    try {
      console.log("Fetching deliveries...");
      const res = await API.get("/api/delivery");
      console.log("Fetched deliveries:", {
        count: res.data.length,
        deliveries: res.data.map(d => ({
          id: d._id,
          status: d.status,
          name: d.name
        }))
      });
      setDeliveries(res.data);
    } catch (err) {
      console.error("Failed to fetch deliveries:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleProofClick = (delivery) => {
    setSelectedDelivery(delivery);
    setShowPopup(true);
  };

  const handleProofSubmit = async (photoDataUrl) => {
    try {
      // Send the proof image as proofUrl (base64 or URL) to backend
      await API.post(`/delivery/${selectedDelivery._id}/proof`, {
        proofUrl: photoDataUrl
      });
      setShowPopup(false);
      setSelectedDelivery(null);
      fetchDeliveries();
    } catch (err) {
      console.error("Failed to submit proof:", err);
    }
  };

  const statuses = ["pending", "in-progress", "completed"];
  const filteredDeliveries = deliveries.filter(d =>
    d.status && d.status.toLowerCase() === activeTab
  );

  useEffect(() => {
    if (deliveries.length > 0) {
      console.log("Delivery statuses:", deliveries.map(d => d.status));
    }
  }, [deliveries]);

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: "#fff4eb",
      minHeight: "100vh"
    }}>
      <div style={{
        background: "#ffe0b2",
        color: "#994d00",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "1.1rem"
      }}>
        Viewing <span style={{ textTransform: "capitalize" }}>{activeTab}</span> deliveries
      </div>

      <div style={{
        background: "linear-gradient(135deg, #cc6600 0%, #994d00 100%)",
        padding: "2rem",
        borderRadius: "10px",
        marginBottom: "2rem",
        boxShadow: "0 4px 6px rgba(204, 102, 0, 0.2)"
      }}>
        <h1 style={{
          marginBottom: "1rem",
          color: "white",
          fontSize: "2.5rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
        }}>Driver Dashboard</h1>

        <div style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              style={{
                padding: "12px 24px",
                background: activeTab === status ? "white" : "rgba(255,255,255,0.1)",
                color: activeTab === status ? "#cc6600" : "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                textTransform: "capitalize",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: activeTab === status ? "0 4px 6px rgba(0,0,0,0.1)" : "none",
                backdropFilter: "blur(5px)"
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(204, 102, 0, 0.1)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "2px solid #f7e6d3",
          paddingBottom: "1rem"
        }}>
          <h2 style={{
            textTransform: "capitalize",
            color: "#cc6600",
            fontSize: "1.8rem",
            margin: 0
          }}>
            {activeTab} Deliveries
          </h2>
          <div style={{
            backgroundColor: "#fff4eb",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            color: "#cc6600",
            fontWeight: "bold"
          }}>
            {filteredDeliveries.length} Deliveries
          </div>
        </div>

        <div style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
        }}>
          {filteredDeliveries.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "3rem",
              color: "#994d00",
              backgroundColor: "#fff4eb",
              borderRadius: "8px",
              border: "2px dashed #f7e6d3"
            }}>
              <p style={{
                fontSize: "1.1rem",
                margin: 0
              }}>
                No {activeTab} deliveries found
              </p>
            </div>
          ) : (
            filteredDeliveries.map((d) => (
              <DeliveryCard
                key={d._id}
                delivery={d}
                onStatusUpdate={fetchDeliveries}
                onProofClick={() => handleProofClick(d)} // ✅ Added
              />
            ))
          )}
        </div>
      </div>

      {/* ✅ Proof Popup */}
      {showPopup && (
        <ProofPopup
          onClose={() => setShowPopup(false)}
          onSubmit={handleProofSubmit}
        />
      )}
    </div>
  );
}