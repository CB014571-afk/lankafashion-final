// Constants for authentication
export const USER_ROLES = {
  SELLER: 'seller',
  SUPPLIER: 'supplier',
  ADMIN: 'admin',
  DRIVER: 'driver',
  BUYER: 'buyer'
};

export const INITIAL_LOGIN_DATA = {
  email: '',
  password: ''
};

export const INITIAL_REGISTER_DATA = {
  name: '',
  email: '',
  password: '',
  role: USER_ROLES.BUYER,
  shopName: '',
  description: ''
};

export const AUTH_STYLES = {
  container: {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "30px",
    backgroundColor: "#fff4eb",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#e2b455",
    fontSize: "24px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#e2b455",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  buttonHover: {
    backgroundColor: "#d4a044",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },
  success: {
    color: "green",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },
  linkContainer: {
    textAlign: "center",
    marginTop: "15px",
  },
  link: {
    color: "#e2b455",
    textDecoration: "none",
    fontWeight: "bold",
  },
  linkHover: {
    textDecoration: "underline",
  },
  divider: {
    margin: "15px 0",
    textAlign: "center",
    color: "#666",
  }
};

export const ROLE_ROUTES = {
  [USER_ROLES.SELLER]: '/seller',
  [USER_ROLES.SUPPLIER]: '/supplier-preorders',
  [USER_ROLES.ADMIN]: '/',
  [USER_ROLES.DRIVER]: '/driver-dashboard',
  [USER_ROLES.BUYER]: '/'
};