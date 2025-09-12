import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function SupplierDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [decisionData, setDecisionData] = useState({
    decision: "approved",
    estimatedDeliveryDate: "",
    supplierNotes: "",
    trackingInfo: "",
  });
  const token = localStorage.getItem("token");

  // Load pending orders assigned to supplier
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/supplier/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Orders data:", res.data); // Add this line to debug
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle approve/reject submit
  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await axios.put(
        `/supplier/orders/${selectedOrder._id}/decision`,
        {
          decision: decisionData.decision,
          estimatedDeliveryDate: decisionData.estimatedDeliveryDate,
          supplierNotes: decisionData.supplierNotes,
          trackingInfo: decisionData.trackingInfo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message);
      setSelectedOrder(null);
      setDecisionData({
        decision: "approved",
        estimatedDeliveryDate: "",
        supplierNotes: "",
        trackingInfo: "",
      });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order decision:", err);
      alert("Failed to update order.");
    }
  };

  // Mark order as delivered
  const markDelivered = async (orderId) => {
    try {
      const res = await axios.put(
        `/supplier/orders/${orderId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      fetchOrders();
    } catch (err) {
      console.error("Error marking order delivered:", err);
      alert("Failed to mark as delivered.");
    }
  };

  if (loading) return <p>Loading orders...</p>;

  if (!orders.length)
    return <p>No pending orders assigned to you at the moment.</p>;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2>Supplier Dashboard - Pending Material Orders</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {orders.map((order) => (
          <li
            key={order._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 15,
              marginBottom: 15,
            }}
          >
            <h3>{order.materialName}</h3>
            <p><strong>Seller:</strong> {order.sellerId?.name} ({order.sellerId?.shopName || "No shop name"})</p>
            <p><strong>Contact Email:</strong> {order.email || "No email provided"}</p>
            {/* Add debug info temporarily */}
            {process.env.NODE_ENV === 'development' && (
              <small style={{color: 'gray'}}>Debug - Full email data: {JSON.stringify({email: order.email, sellerEmail: order.sellerId?.email})}</small>
            )}
            <p><strong>Quantity:</strong> {order.quantity}</p>
            <p><strong>Preferred Delivery Date:</strong> {new Date(order.preferredDate).toLocaleDateString()}</p>
            <p><strong>Payment Option:</strong> {order.paymentOption}</p>
            <p><strong>Status:</strong> {order.status}</p>
            {order.trackingInfo && <p><strong>Tracking Info:</strong> {order.trackingInfo}</p>}
            {order.supplierNotes && <p><strong>Supplier Notes:</strong> {order.supplierNotes}</p>}

            {order.status === "pending" && (
              <>
                <button onClick={() => setSelectedOrder(order)}>Review / Decide</button>
              </>
            )}

            {order.status === "approved" && (
              <button onClick={() => markDelivered(order._id)}>
                Mark as Delivered
              </button>
            )}
          </li>
        ))}
      </ul>

      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={handleDecisionSubmit}
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: 400,
              boxShadow: "0 0 10px rgba(0,0,0,0.25)",
            }}
          >
            <h3>Review Order: {selectedOrder.materialName}</h3>
            <p><strong>Seller Email:</strong> {selectedOrder.email}</p>

            <label>
              Decision:
              <select
                value={decisionData.decision}
                onChange={(e) =>
                  setDecisionData({ ...decisionData, decision: e.target.value })
                }
                required
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </label>

            <label style={{ display: "block", marginTop: 10 }}>
              Estimated Delivery Date:
              <input
                type="date"
                value={decisionData.estimatedDeliveryDate}
                onChange={(e) =>
                  setDecisionData({ ...decisionData, estimatedDeliveryDate: e.target.value })
                }
                required={decisionData.decision === "approved"}
              />
            </label>

            <label style={{ display: "block", marginTop: 10 }}>
              Supplier Notes:
              <textarea
                rows={3}
                value={decisionData.supplierNotes}
                onChange={(e) =>
                  setDecisionData({ ...decisionData, supplierNotes: e.target.value })
                }
              />
            </label>

            <label style={{ display: "block", marginTop: 10 }}>
              Tracking Info:
              <input
                type="text"
                value={decisionData.trackingInfo}
                onChange={(e) =>
                  setDecisionData({ ...decisionData, trackingInfo: e.target.value })
                }
                placeholder="Shipment tracking number, courier etc."
              />
            </label>

            <div style={{ marginTop: 15 }}>
              <button type="submit" style={{ marginRight: 10 }}>
                Submit
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </>
  );
}