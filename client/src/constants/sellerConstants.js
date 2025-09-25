// Constants for seller dashboard
export const TABS = {
  STORE: 'store',
  ADD: 'add',
  ORDERS: 'orders',
  PRE_ORDERS: 'preorders',
  PROFILE: 'profile'
};

export const ORDER_TABS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
};

export const INITIAL_PRODUCT_DATA = {
  name: "",
  description: "",
  price: "",
  category: "",
  images: "",
};

export const INITIAL_PROFILE_DATA = {
  name: "",
  email: "",
  shopName: "",
  description: "",
};

export const INITIAL_PASSWORD_DATA = {
  currentPassword: "",
  newPassword: "",
};

export const SELLER_STYLES = {
  container: {
    padding: "20px"
  },
  header: {
    color: "#e2b455"
  },
  tabContainer: {
    marginBottom: "20px"
  },
  tabButton: (active) => ({
    padding: "10px 20px",
    margin: "0 5px",
    background: active ? "#e2b455" : "#f4f4f4",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  }),
  storeInfo: {
    marginBottom: "10px",
    background: "#fdf5e6",
    padding: "10px",
    borderRadius: "8px",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  productCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    textAlign: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover"
  },
  productContent: {
    padding: "10px"
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    justifyContent: "center"
  },
  editButton: {
    background: "#ffa500",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  deleteButton: {
    background: "#f44336",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  orderCard: {
    border: "1px solid #ddd",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    maxWidth: "800px"
  },
  orderTabButton: (active) => ({
    background: active ? "#e2b455" : "#f4f4f4",
    border: "1px solid #ccc",
    padding: "8px 16px",
    marginRight: "10px",
    borderRadius: "4px",
    cursor: "pointer",
  }),
  formContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "8px",
  },
  formGroup: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px"
  },
  textarea: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    minHeight: "100px",
    resize: "vertical"
  },
  submitButton: {
    background: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px"
  },
  cancelButton: {
    background: "#f44336",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginLeft: "10px"
  },
  preOrderCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    margin: "10px 0",
    backgroundColor: "#fafafa"
  },
  preOrderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  preOrderDetails: {
    lineHeight: "1.6"
  },
  statusBadge: {
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold"
  }
};