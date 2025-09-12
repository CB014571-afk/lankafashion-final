import React, { useEffect, useState } from "react";
import API from "../services/api";


export default function SellerPreOrders() {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentOrder, setPaymentOrder] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return;
    API.get(`/api/preorder/seller/${user._id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setPreorders(res.data))
      .catch(() => setError("Error loading preorders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 30, background: "#fff4eb", borderRadius: 10 }}>
      <h2 style={{ textAlign: "center", color: "#cc6600" }}>My PreOrders</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? <p>Loading...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7e6d3" }}>
              <th>Material</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Payment Option</th>
              <th>Supplier Price</th>
              <th>Status</th>
              <th>Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {preorders.map(order => (
              <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{order.materialName}</td>
                <td>{order.quantity}</td>
                <td>{order.preferredDate ? new Date(order.preferredDate).toLocaleDateString() : ""}</td>
                <td>{order.paymentOption === "pay_now" ? "Pay Now" : "Pay Later"}</td>
                <td>
                  {order.supplierResponse?.accepted && (
                    <span>Rs {order.supplierResponse.price}</span>
                  )}
                  {!order.supplierResponse?.accepted && <span>-</span>}
                </td>
                <td>
                  {order.supplierResponse?.accepted && !order.paid && (
                    <>
                      <button
                        onClick={() => setPaymentOrder(order._id)}
                        style={{ background: "#4caf50", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer", marginRight: 8 }}
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => {
                          API.delete(`/api/preorder/${order._id}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                          }).then(() => window.location.reload());
                        }}
                        style={{ background: "#f44336", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {order.paid && (
                    <span style={{ color: '#2196f3', fontWeight: 'bold' }}>Paid</span>
                  )}
                  {order.supplierResponse?.accepted === false && (
                    <span style={{ color: '#f44336', fontWeight: 'bold' }}>Rejected by Supplier</span>
                  )}
                  {order.status === "pending" && (
                    <button
                      onClick={() => {
                        API.delete(`/api/preorder/${order._id}`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                        }).then(() => window.location.reload());
                      }}
                      style={{ background: "#f44336", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {paymentOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Payment for PreOrder</h3>
            <p>Amount: Rs {preorders.find(o => o._id === paymentOrder)?.supplierResponse?.price}</p>
            {/* Add payment form fields here */}
            <button
              onClick={() => {
                API.patch(`/api/preorder/${paymentOrder}/pay`, {}, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }).then(() => { setPaymentOrder(null); window.location.reload(); });
              }}
              style={{ background: "#4caf50", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer", marginRight: 8 }}
            >
              Confirm Payment
            </button>
            <button onClick={() => setPaymentOrder(null)} style={{ background: "#f44336", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
