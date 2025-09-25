// Constants for supplier dashboard
export const DECISION_OPTIONS = {
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const INITIAL_DECISION_DATA = {
  decision: DECISION_OPTIONS.APPROVED,
  estimatedDeliveryDate: "",
  supplierNotes: "",
  trackingInfo: "",
};

export const DASHBOARD_STYLES = {
  container: {
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    fontFamily: "Arial"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  preOrderButton: {
    background: "#cc6600",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    textDecoration: "none",
    fontWeight: "bold"
  },
  orderList: {
    listStyle: "none",
    padding: 0
  },
  orderItem: {
    background: "#f9f9f9",
    margin: "10px 0",
    padding: 15,
    borderRadius: "5px",
    border: "1px solid #ddd"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    background: "white",
    padding: 30,
    borderRadius: "10px",
    width: "90%",
    maxWidth: 600
  },
  formGroup: {
    marginBottom: 15
  },
  input: {
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: "4px"
  },
  textarea: {
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: "4px",
    height: 80,
    resize: "vertical"
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    marginTop: 20
  },
  submitButton: {
    background: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  cancelButton: {
    background: "#f44336",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  viewButton: {
    background: "#2196F3",
    color: "white",
    padding: "8px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: 10
  }
};