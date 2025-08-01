import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const containerStyle = {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    backgroundColor: "#fdf6f0",
    borderRadius: "10px",
    fontFamily: "Arial, sans-serif",
  };

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const itemStyle = {
    paddingLeft: "10px",
    marginBottom: "6px",
  };

  const titleStyle = {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#cc6600",
    fontWeight: "bold",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Your Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={cardStyle}>
            <h3>Order #{order._id.slice(-6)}</h3>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {order.status || "Processing"}</p>
            <p><strong>Total:</strong> Rs {order.totalAmount}</p>
            <div style={{ marginTop: "10px" }}>
              <strong>Items:</strong>
              {order.products.map((item, i) => (
                <div key={i} style={itemStyle}>
                  - {item.name} (Qty: {item.quantity})<br />
                  {item.ukSize && <>Size: {item.ukSize} | </>}
                  {item.specialRequest && <>Request: {item.specialRequest}</>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
