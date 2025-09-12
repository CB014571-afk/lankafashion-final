import React, { useEffect, useState } from "react";
import API from "../services/api";


export default function SupplierPreOrders() {
  const [preorders, setPreorders] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [priceInputs, setPriceInputs] = useState({});

  useEffect(() => {
    const fetchPreorders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/preorder/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPreorders(res.data);
      } catch (err) {
        setError("Error loading preorders.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreorders();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return;
    API.get(`/preorder/pending`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => setPreorders(res.data))
      .catch(() => setError("Error loading preorders."))
      .finally(() => setLoading(false));
    // Fetch accepted and rejected as well
    API.get(`/preorder/accepted`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then((res) => setAccepted(res.data));
    API.get(`/preorder/rejected`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then((res) => setRejected(res.data));
  }, []);

  const handlePriceChange = (id, value) => {
    setPriceInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const token = localStorage.getItem("token");
      const res = await API.patch(
        `/preorder/${id}/action`,
        { action, price: action === "accept" ? priceInputs[id] : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreorders(preorders.map((p) => (p._id === id ? res.data : p)));
      setPriceInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      setError("Error updating preorder.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <div>Loading preorders...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div
      style={{
        maxWidth: 1200, // Increased width
        margin: "40px auto",
        padding: 30,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#cc6600", marginBottom: "30px" }}>Supplier PreOrders</h2>
      {preorders.length === 0 && accepted.length === 0 && rejected.length === 0 ? (
        <p>No preorders found.</p>
      ) : (
        <>
          {preorders.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h3 style={{ color: "#666", marginBottom: "20px" }}>Pending PreOrders</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "separate",
                  borderSpacing: "0",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 0 10px rgba(0,0,0,0.05)"
                }}>
                  <thead>
                    <tr style={{ 
                      background: "#f8f9fa",
                      borderBottom: "2px solid #dee2e6"
                    }}>
                      <th style={tableHeaderStyle}>Material</th>
                      <th style={tableHeaderStyle}>Contact Info</th>
                      <th style={tableHeaderStyle}>Quantity</th>
                      <th style={tableHeaderStyle}>Preferred Date</th>
                      <th style={tableHeaderStyle}>Payment</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Price</th>
                      <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preorders.map((order, index) => (
                      <tr key={order._id} 
                          style={{ 
                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                            borderBottom: "1px solid #dee2e6"
                          }}>
                        <td style={tableCellStyle}>{order.materialName}</td>
                        <td style={tableCellStyle}>
                          <div style={{ fontSize: "14px" }}>
                            <div style={{ marginBottom: "4px" }}>📧 {order.email}</div>
                            <div>📞 {order.contactNumber}</div>
                          </div>
                        </td>
                        <td style={tableCellStyle}>{order.quantity}</td>
                        <td style={tableCellStyle}>
                          {new Date(order.preferredDate).toLocaleDateString()}
                        </td>
                        <td style={tableCellStyle}>
                          {order.paymentOption === "pay_now" ? 
                            <span style={{ color: "#28a745" }}>Pay Now</span> : 
                            <span style={{ color: "#ffc107" }}>Pay Later</span>
                          }
                        </td>
                        <td style={tableCellStyle}>
                          <span style={getStatusBadgeStyle(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{order.supplierResponse?.price || "-"}</td>
                        <td style={tableCellStyle}>
                          {order.status === "pending" && (
                            <>
                              <input
                                type="number"
                                placeholder="Set Price"
                                value={priceInputs[order._id] || ""}
                                onChange={(e) =>
                                  handlePriceChange(order._id, e.target.value)
                                }
                                style={{ width: 80, marginRight: 8 }}
                              />
                              <button
                                onClick={() => handleAction(order._id, "accept")}
                                disabled={actionLoading === order._id + "accept"}
                                style={{
                                  marginRight: 8,
                                  background: "#4caf50",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  padding: "6px 12px",
                                  cursor: "pointer",
                                }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleAction(order._id, "reject")}
                                disabled={actionLoading === order._id + "reject"}
                                style={{
                                  background: "#f44336",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  padding: "6px 12px",
                                  cursor: "pointer",
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status !== "pending" && (
                            <span>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {accepted.length > 0 && (
            <div>
              <h3>Accepted PreOrders</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#d3f7e6" }}>
                    <th>Material</th>
                    <th>Contact Info</th>
                    <th>Quantity</th>
                    <th>Preferred Date</th>
                    <th>Payment Option</th>
                    <th>Status</th>
                    <th>Supplier Price</th>
                  </tr>
                </thead>
                <tbody>
                  {accepted.map((order) => (
                    <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td>{order.materialName}</td>
                      <td>
                        Email: {order.email}<br/>
                        Phone: {order.contactNumber}
                      </td>
                      <td>{order.quantity}</td>
                      <td>
                        {order.preferredDate
                          ? new Date(order.preferredDate).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        {order.paymentOption === "pay_now"
                          ? "Pay Now"
                          : "Pay Later"}
                      </td>
                      <td>{order.status}</td>
                      <td>{order.supplierResponse?.price || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {rejected.length > 0 && (
            <div>
              <h3>Rejected PreOrders</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f7d3d3" }}>
                    <th>Material</th>
                    <th>Contact Info</th>
                    <th>Quantity</th>
                    <th>Preferred Date</th>
                    <th>Payment Option</th>
                    <th>Status</th>
                    <th>Supplier Price</th>
                  </tr>
                </thead>
                <tbody>
                  {rejected.map((order) => (
                    <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td>{order.materialName}</td>
                      <td>
                        Email: {order.email}<br/>
                        Phone: {order.contactNumber}
                      </td>
                      <td>{order.quantity}</td>
                      <td>
                        {order.preferredDate
                          ? new Date(order.preferredDate).toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        {order.paymentOption === "pay_now"
                          ? "Pay Now"
                          : "Pay Later"}
                      </td>
                      <td>{order.status}</td>
                      <td>{order.supplierResponse?.price || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: "12px 15px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "14px",
  color: "#495057",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tableCellStyle = {
  padding: "12px 15px",
  fontSize: "14px",
  color: "#212529"
};

const getStatusBadgeStyle = (status) => {
  const baseStyle = {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500"
  };
  
  const colors = {
    pending: { bg: "#fff3cd", color: "#856404" },
    accepted: { bg: "#d4edda", color: "#155724" },
    rejected: { bg: "#f8d7da", color: "#721c24" },
    delivered: { bg: "#cce5ff", color: "#004085" }
  };

  const statusColor = colors[status] || colors.pending;
  return {
    ...baseStyle,
    backgroundColor: statusColor.bg,
    color: statusColor.color
  };
};
