import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./BuyerOrders.css";
import { downloadReceipt, downloadHTMLReceipt } from "../utils/receiptGenerator";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        
        console.log("🔍 Token exists:", !!token);
        console.log("🔍 User ID:", userId);
        
        if (!token) {
          console.log("❌ No token found in localStorage");
          setError("Please log in to view your orders");
          setOrders([]);
          setLoading(false);
          return;
        }

        console.log("📡 Making API call to /api/orders/my");
        console.log("📡 Using token:", token?.substring(0, 20) + "...");
        
        const res = await API.get("/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("✅ API Response status:", res.status);
        console.log("✅ API Response data:", res.data);
        console.log("📊 Orders count:", res.data?.length || 0);
        
        // Only show real orders from API
        const apiOrders = Array.isArray(res.data) ? res.data : [];
        setOrders(apiOrders);
        
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        console.error("❌ Response status:", err.response?.status);
        console.error("❌ Response data:", err.response?.data);
        console.error("❌ Request config:", err.config);
        
        if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
          // Clear invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        } else if (err.response?.status === 404) {
          setError("Orders endpoint not found");
        } else if (err.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(`Failed to load orders: ${err.message || 'Unknown error'}`);
        }
        
        // Show empty array on error
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
        <h2>My Porders</h2>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div>Loading your orders...</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Please wait while we fetch your order history
          </div>
        </div>
      ) : error ? (
        <div className="error-message" style={{
          background: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          color: '#c62828'
        }}>
          <h3>⚠️ {error}</h3>
          <p>Please make sure you're logged in and try again.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">
          <h3>No Orders Found</h3>
          <p>You haven't made any purchases yet.</p>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
            When you purchase items, your real orders and delivery status will appear here.
          </p>
        </div>
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
                  <div className="order-id">Order #: {order._id?.slice(-8) || 'N/A'}</div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
                
                <div className="order-info">
                  <div className="order-date">Ordered on: {created}</div>
                  <div className="order-total">Total: Rs {total.toLocaleString()}</div>
                  <div className="order-payment-status">
                    Payment: <span className={`payment-status ${order.paymentStatus || 'pending'}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="receipt-btn"
                      onClick={() => downloadReceipt(order)}
                      title="Download Text Receipt"
                    >
                      📄 Download Receipt
                    </button>
                    <button 
                      className="receipt-btn html"
                      onClick={() => downloadHTMLReceipt(order)}
                      title="Download Printable Receipt"
                    >
                      🖨️ Print Receipt
                    </button>
                  </div>
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
