

import React, { useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function SellerOrders() {
  const { user, token } = useAuth();
  console.log("[SellerOrders] user:", user);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;
      console.log("Fetching orders for", user._id);
      setLoading(true);
      setError("");
      try {
        console.log("About to call API.get for orders", `/api/orders/seller/${user._id}`);
        const [pendingRes, completedRes] = await Promise.all([
          API.get(`/api/orders/seller/${user._id}`),
          API.get(`/api/orders/seller/${user._id}/completed`),
        ]);
        setPendingOrders(pendingRes.data);
        setCompletedOrders(completedRes.data);
      } catch (err) {
        setError("Error loading orders.");
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleMarkDone = async (orderId, itemId) => {
    setMarkingId(itemId);
    try {
      await API.put(`/api/orders/${orderId}/item/${itemId}/done`);
      setPendingOrders((prev) =>
        prev
          .map((order) => {
            if (order._id !== orderId) return order;
            return {
              ...order,
              items: order.items.filter((item) => item._id !== itemId),
            };
          })
          .filter((order) => order.items.length > 0)
      );
      // Optionally, refetch completed orders
      const completedRes = await API.get(`/api/orders/seller/${user._id}/completed`);
      setCompletedOrders(completedRes.data);
    } catch (err) {
      setError("Error marking order as done.");
    } finally {
      setMarkingId("");
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading orders...</div>;
  if (error) return <div style={{ color: "red", textAlign: "center", marginTop: 50 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 30, background: "#fff4eb", borderRadius: 10 }}>
      <h2 style={{ textAlign: "center", color: "#cc6600" }}>Pending Orders</h2>
      {pendingOrders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40 }}>
          <thead>
            <tr style={{ background: "#f7e6d3" }}>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) =>
              order.items.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{item.product?.name || "-"}</td>
                  <td>{item.qty}</td>
                  <td>{item.price}</td>
                  <td>{order.buyer?.name || "-"}</td>
                  <td>{item.status}</td>
                  <td>
                    <button
                      onClick={() => handleMarkDone(order._id, item._id)}
                      disabled={markingId === item._id}
                      style={{ background: "#4caf50", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
                    >
                      {markingId === item._id ? "Marking..." : "Mark as Done"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <h2 style={{ textAlign: "center", color: "#cc6600" }}>Completed Orders</h2>
      {completedOrders.length === 0 ? (
        <p>No completed orders.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#e0ffe0" }}>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.map((order) =>
              order.items.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{item.product?.name || "-"}</td>
                  <td>{item.qty}</td>
                  <td>{item.price}</td>
                  <td>{order.buyer?.name || "-"}</td>
                  <td>{item.status}</td>
                  <td>{item.completedAt ? new Date(item.completedAt).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
