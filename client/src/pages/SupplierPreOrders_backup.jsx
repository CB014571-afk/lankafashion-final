import React, { useState } from "react";
import { useSupplierPreOrders } from "../hooks/useSupplierPreOrders";
import { PREORDER_STYLES, PREORDER_ACTIONS } from "../constants/preOrderConstants";
import { handleApiError } from "../utils/supplierUtils";
import { LoadingSpinner, ErrorMessage } from "../components/supplier/SupplierComponents";
import { TabNavigation, PreOrderTable } from "../components/supplier/PreOrderComponents";

export default function SupplierPreOrders() {
  const { 
    pending, 
    accepted, 
    rejected, 
    loading, 
    error, 
    actionLoading,
    updatePreOrderStatus 
  } = useSupplierPreOrders();
  
  const [activeTab, setActiveTab] = useState('pending');

  // Handle accepting a pre-order
  const handleAccept = async (preorderId, additionalData) => {
    try {
      await updatePreOrderStatus(preorderId, PREORDER_ACTIONS.ACCEPT, additionalData);
      alert("Pre-order accepted successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to accept pre-order");
      alert(errorMessage);
    }
  };

  // Handle rejecting a pre-order
  const handleReject = async (preorderId) => {
    if (!confirm("Are you sure you want to reject this pre-order?")) {
      return;
    }
    
    try {
      await updatePreOrderStatus(preorderId, PREORDER_ACTIONS.REJECT);
      alert("Pre-order rejected successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to reject pre-order");
      alert(errorMessage);
    }
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'pending':
        return pending;
      case 'accepted':
        return accepted;
      case 'rejected':
        return rejected;
      default:
        return [];
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner message="Loading pre-orders..." />;
  }

  // Render error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  const tabs = [
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'accepted', label: 'Accepted', count: accepted.length },
    { key: 'rejected', label: 'Rejected', count: rejected.length }
  ];

  return (
    <div style={PREORDER_STYLES.container}>
      <h2>Supplier Pre-Order Requests</h2>
      
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      <PreOrderTable
        preorders={getCurrentTabData()}
        onAccept={handleAccept}
        onReject={handleReject}
        actionLoading={actionLoading}
        showActions={activeTab === 'pending'}
      />
    </div>
  );
}
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to access supplier features.");
          return;
        }

        console.log("🔍 SupplierPreOrders: Starting to fetch data...");
        console.log("🔑 Token exists:", !!token);
        
        setLoading(true);
        
        // Fetch all preorder data in parallel
        console.log("📡 Making API calls to:", {
          pending: "/preorder/pending",
          accepted: "/preorder/accepted", 
          rejected: "/preorder/rejected"
        });
        
        const [pendingRes, acceptedRes, rejectedRes] = await Promise.all([
          API.get("/preorder/pending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/preorder/accepted", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/preorder/rejected", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        console.log("✅ API Responses received:");
        console.log("Pending:", pendingRes.data.length, "items");
        console.log("Accepted:", acceptedRes.data.length, "items");
        console.log("Rejected:", rejectedRes.data.length, "items");

        setPreorders(pendingRes.data);
        setAccepted(acceptedRes.data);
        setRejected(rejectedRes.data);
      } catch (err) {
        console.error("❌ Error loading preorders:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError("Error loading preorders.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const refreshAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [pendingRes, acceptedRes, rejectedRes] = await Promise.all([
        API.get("/preorder/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/preorder/accepted", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/preorder/rejected", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setPreorders(pendingRes.data);
      setAccepted(acceptedRes.data);
      setRejected(rejectedRes.data);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

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
      setPriceInputs((prev) => ({ ...prev, [id]: "" }));
      // Refresh all data to get updated lists
      await refreshAllData();
    } catch (err) {
      console.error("Error updating preorder:", err);
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
