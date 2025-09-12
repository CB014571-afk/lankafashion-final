import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./BuyerOrders.css";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed filter dropdown and status

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Show all orders, no filter
  const filteredOrders = orders;

  const getStatusClass = (status) => {
    if (!status || typeof status !== "string") return "status-default";
    switch(status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      case 'done': return 'status-completed';
      default: return 'status-default';
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Order History</h2>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">No orders found.</div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const items = order.items || order.products || [];
            const total = order.total ?? order.totalAmount ?? 0;
            const created = order.createdAt 
              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : '-';

            return (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  {order.status && order.status.toLowerCase() !== "processing" && (
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  )}
                </div>
                
                <div className="order-info">
                  <div className="order-date">Ordered on: {created}</div>
                  <div className="order-total">Total: Rs {total.toLocaleString()}</div>
                </div>

                <div className="order-items">
                  <h4>Items</h4>
                  {items.map((item, i) => {
                    const name = item.product?.name ?? item.name ?? "Item";
                    const qty = item.qty ?? item.quantity ?? 1;
                    const unitPrice = item.price ?? item.unitPrice;

                    return (
                      <div key={i} className="order-item">
                        <div className="item-name">{name}</div>
                        <div className="item-details">
                          <span>Qty: {qty}</span>
                          {typeof unitPrice === "number" && 
                            <span>Price: Rs {unitPrice.toLocaleString()}</span>
                          }
                        </div>
                        {(item.ukSize || item.specialRequest) && (
                          <div className="item-extras">
                            {item.ukSize && <span>Size: {item.ukSize}</span>}
                            {item.specialRequest && 
                              <span>Special Request: {item.specialRequest}</span>
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
