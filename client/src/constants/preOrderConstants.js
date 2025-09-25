// Constants and styles for pre-orders
export const PREORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PAID: 'paid',
  DELIVERED: 'delivered'
};

export const PREORDER_ACTIONS = {
  ACCEPT: 'accept',
  REJECT: 'reject'
};

export const PREORDER_STYLES = {
  container: {
    maxWidth: 1200,
    margin: "auto",
    padding: 20,
    fontFamily: "Arial"
  },
  tabContainer: {
    display: "flex",
    borderBottom: "2px solid #ddd",
    marginBottom: 20
  },
  tab: {
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    fontWeight: "bold",
    transition: "all 0.3s"
  },
  activeTab: {
    borderBottom: "2px solid #cc6600",
    color: "#cc6600"
  },
  tableContainer: {
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px"
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
    padding: "12px",
    textAlign: "left",
    borderBottom: "1px solid #ddd"
  },
  tableCell: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top"
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  actionButton: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    margin: "2px",
    transition: "background-color 0.3s"
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    color: "white"
  },
  rejectButton: {
    backgroundColor: "#f44336",
    color: "white"
  },
  priceInput: {
    width: "80px",
    padding: "4px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "12px"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "16px"
  }
};

export const getStatusColor = (status) => {
  const colors = {
    [PREORDER_STATUS.PENDING]: '#ffa500',
    [PREORDER_STATUS.ACCEPTED]: '#4CAF50',
    [PREORDER_STATUS.REJECTED]: '#f44336',
    [PREORDER_STATUS.PAID]: '#2196F3',
    [PREORDER_STATUS.DELIVERED]: '#9C27B0'
  };
  return colors[status] || '#666';
};