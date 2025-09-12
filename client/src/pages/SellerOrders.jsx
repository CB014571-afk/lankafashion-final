import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SellerOrders() {
  const { user, token } = useAuth();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      if (!user?._id || !token) return;
      setLoading(true);
      setError("");

      try {
        const auth = { headers: { Authorization: `Bearer ${token}` } };

        const [pendingRes, completedRes] = await Promise.all([
          API.get(`/api/orders/seller/${user._id}`, auth),
          API.get(`/api/orders/seller/${user._id}/completed`, auth),
        ]);

        if (!cancelled) {
          setPendingOrders(pendingRes.data || []);
          setCompletedOrders(completedRes.data || []);
        }
      } catch (err) {
        if (!cancelled) setError("Error loading orders.");
        console.error("Order fetch error:", err.response?.data || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user?._id, token]); // rerun when user or token becomes available

  const handleMarkDone = async (orderId, itemId) => {
    if (!token) return;
    setMarkingId(itemId);
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      await API.put(`/api/orders/${orderId}/item/${itemId}/done`, null, auth);

      // optimistically update pending list
      setPendingOrders((prev) =>
        prev
          .map((order) =>
            order._id === orderId
              ? { ...order, items: order.items.filter((it) => it._id !== itemId) }
              : order
          )
          .filter((order) => order.items.length > 0)
      );

      // refresh completed list
      const completedRes = await API.get(`/api/orders/seller/${user._id}/completed`, auth);
      setCompletedOrders(completedRes.data || []);
    } catch (err) {
      setError("Error marking order as done.");
      console.error("Mark done error:", err.response?.data || err.message);
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
            {pendingOrders.flatMap((order) =>
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
                      style={{
                        background: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
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
            {completedOrders.flatMap((order) =>
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
