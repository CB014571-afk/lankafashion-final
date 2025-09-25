// Constants for driver dashboard
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const DRIVER_TABS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed'
};

export const DELIVERY_CHARGE = 300;

export const DRIVER_STYLES = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    textAlign: "center",
    color: "#e2b455",
    marginBottom: "30px"
  },
  tabContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    justifyContent: "center"
  },
  tab: (active) => ({
    padding: "12px 24px",
    background: active ? "#e2b455" : "#f5f5f5",
    color: active ? "white" : "#333",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease"
  }),
  deliveryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  deliveryCard: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease"
  },
  deliveryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  deliveryId: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333"
  },
  statusBadge: (status) => {
    const colors = {
      pending: { bg: "#fff3cd", color: "#856404" },
      accepted: { bg: "#cce5ff", color: "#004085" },
      completed: { bg: "#d4edda", color: "#155724" },
      cancelled: { bg: "#f8d7da", color: "#721c24" }
    };
    const statusColor = colors[status] || colors.pending;
    return {
      padding: "4px 12px",
      borderRadius: "15px",
      fontSize: "12px",
      fontWeight: "bold",
      backgroundColor: statusColor.bg,
      color: statusColor.color,
      textTransform: "capitalize"
    };
  },
  deliveryInfo: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#555",
    marginBottom: "15px"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "15px"
  },
  actionButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s ease"
  },
  acceptButton: {
    backgroundColor: "#28a745",
    color: "white"
  },
  completeButton: {
    backgroundColor: "#007bff",
    color: "white"
  },
  proofButton: {
    backgroundColor: "#007bff",
    color: "white"
  },
  viewButton: {
    backgroundColor: "#6c757d",
    color: "white"
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
    fontSize: "16px"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "50px"
  }
};