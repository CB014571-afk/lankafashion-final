import React, { useEffect, useState } from "react";
import API from "../api";

const tabBtn = (active) => ({
  padding: "10px 20px",
  margin: "0 5px",
  background: active ? "#e2b455" : "#f4f4f4",
  border: "1px solid #ccc",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
});

export default function SellerDashboard() {
  const [tab, setTab] = useState("store");
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [materialOrders, setMaterialOrders] = useState([]);
    const [preOrders, setPreOrders] = useState([]);
  const fetchPreOrders = async () => {
    if (!sellerId) {
      console.error("❌ No sellerId in localStorage");
      return;
    }
    try {
      const res = await API.get(`/preorder/seller/${sellerId}`, { headers });
      setPreOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching preorders:", err);
      setPreOrders([]);
    }
  };
  const [profile, setProfile] = useState({});
  const [editingProductId, setEditingProductId] = useState(null);
  const [orderTab, setOrderTab] = useState("pending");

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: "",
  });

  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  // Fix: Add paymentOrder state for preorder payment modal
  const [paymentOrder, setPaymentOrder] = useState(null);

  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("userId");
  const headers = { Authorization: `Bearer ${token}` };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sellerId || !token) {
      window.location.href = "/login";
    }
  }, [sellerId, token]);

  // -------- Fetch seller's products --------
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products/mine", { headers });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  // -------- Fetch seller's orders (pending + completed) --------
  const fetchOrders = async () => {
    if (!sellerId) {
      console.error("❌ No sellerId in localStorage");
      return;
    }
    try {
      const [pendingRes, completedRes] = await Promise.all([
        API.get(`/orders/seller/${sellerId}`, { headers }),
        API.get(`/orders/seller/${sellerId}/completed`, { headers }),
      ]);

      setPendingOrders(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      setCompletedOrders(Array.isArray(completedRes.data) ? completedRes.data : []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setPendingOrders([]);
      setCompletedOrders([]);
    }
  };

  // -------- Fetch seller's material pre-orders --------
  const fetchMaterialOrders = async () => {
    if (!sellerId) {
      console.error("❌ No sellerId in localStorage");
      return;
    }
    try {
      const res = await API.get(`/material-orders/seller/${sellerId}`, { headers });
      setMaterialOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching material orders:", err);
      setMaterialOrders([]);
    }
  };

  // -------- Load profile only from localStorage (quick display) --------
  const fetchProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setProfile(userData);
      setProfileForm({
        name: userData?.name || "",
        email: userData?.email || "",
        shopName: userData?.shopName || "",
        description: userData?.description || "",
      });
    } catch (err) {
      console.error("❌ Error loading profile from localStorage:", err);
    }
  };

  // -------- Initial load --------
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchProfile(),
        fetchOrders(),
        fetchMaterialOrders(),
        fetchPreOrders()
      ]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Add or update product --------
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        images: newProduct.images
          ? newProduct.images.split(",").map((s) => s.trim())
          : [],
      };

      if (editingProductId) {
        await API.put(`/products/${editingProductId}`, payload, { headers });
        alert("Product updated!");
        setEditingProductId(null);
      } else {
        await API.post("/products/add", payload, { headers });
        alert("Product added!");
      }

      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        images: "",
      });
      setTab("store");
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product");
    }
  };

  // -------- Delete product --------
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/products/${productId}`, { headers });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images?.join(", ") || "",
    });
    setEditingProductId(product._id);
    setTab("add");
  };

  // -------- Mark order item as done --------
  const handleOrderDone = async (orderId, itemId) => {
    if (!window.confirm("Mark this item as done?")) return;
    try {
      await API.put(`/orders/${orderId}/item/${itemId}/done`, {}, { headers });
      // Refetch orders to update UI
      await fetchOrders();
    } catch (err) {
      console.error("Error marking order done:", err);
      alert("Failed to mark order as done");
    }
  };

  // -------- Update profile --------
  const handleProfileUpdate = async () => {
    try {
      await API.put("/users/profile", profileForm, { headers });
      alert("Profile updated!");
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  // -------- Change password --------
  const handlePasswordChange = async () => {
    try {
      await API.put("/users/change-password", passwordForm, { headers });
      alert("Password updated!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      alert("Error changing password");
    }
  };

  // Helper: Status badge for material order statuses
  const statusBadge = (status) => {
    const colors = {
      pending: "#f0ad4e",
      approved: "#5cb85c",
      rejected: "#d9534f",
      delivered: "#0275d8",
    };
    return (
      <span
        style={{
          backgroundColor: colors[status] || "#777",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: "5px",
          fontSize: "12px",
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) return <div style={{ padding: 20 }}>Loading seller dashboard...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#e2b455" }}>Seller Dashboard</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button style={tabBtn(tab === "store")} onClick={() => setTab("store")}>
          My Store
        </button>
        <button style={tabBtn(tab === "add")} onClick={() => setTab("add")}>
          {editingProductId ? "Edit Product" : "Add Product"}
        </button>
        <button style={tabBtn(tab === "orders")} onClick={() => setTab("orders")}>
          Orders
        </button>
    {/* Removed Material Pre-Orders tab, only using PreOrder Requests */}
        <button style={tabBtn(tab === "profile")} onClick={() => setTab("profile")}>
          Profile
        </button>
      </div>

      {/* My Store */}
      {tab === "store" && (
        <div>
          <h2>My Store</h2>
          <div
            style={{
              marginBottom: "10px",
              background: "#fdf5e6",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <p>
              <b>Shop Name:</b> {profile.shopName || "Not set"}
            </p>
            <p>
              <b>Description:</b> {profile.description || "No description yet"}
            </p>
            <p>
              <b>Contact Email:</b> {profile.email}
            </p>
          </div>

          <h3>Products</h3>
          {products.length === 0 ? (
            <p>No products added yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {products.map((p) => (
                <div
                  key={p._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    textAlign: "center",
                    overflow: "hidden",
                  }}
                >
                  {p.images?.[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <div style={{ padding: "10px" }}>
                    <h4>{p.name}</h4>
                    <p>{p.description}</p>
                    <p>
                      <b>Rs {p.price}</b>
                    </p>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleEditProduct(p)}
                        style={{
                          background: "#007bff",
                          color: "#fff",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product */}
      {tab === "add" && (
        <div>
          <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>
          <form
            onSubmit={handleProductSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "400px",
              background: "#fff",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Image URLs (comma separated)"
              value={newProduct.images}
              onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
            />
            <button
              type="submit"
              style={{
                background: "#e2b455",
                color: "#fff",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              {editingProductId ? "Update Product" : "Add Product"}
            </button>
          </form>
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div>
          <h2>Orders</h2>
          <div style={{ marginBottom: "10px" }}>
            <button
              style={tabBtn(orderTab === "pending")}
              onClick={() => setOrderTab("pending")}
            >
              Pending Orders
            </button>
            <button
              style={tabBtn(orderTab === "completed")}
              onClick={() => setOrderTab("completed")}
            >
              Completed Orders
            </button>
          </div>

          {orderTab === "pending" ? (
            pendingOrders.length === 0 ? (
              <p>No pending orders.</p>
            ) : (
              pendingOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    background: "#fff",
                  }}
                >
                  <p>
                    <b>Buyer:</b> {order.buyer?.name} ({order.buyer?.email})
                  </p>

                  {/* If you add address fields in your order/buyer, they'll show here automatically */}
                  {order.shippingAddress && (
                    <p>
                      <b>Deliver to:</b>{" "}
                      {[
                        order.shippingAddress.addressLine1,
                        order.shippingAddress.addressLine2,
                        order.shippingAddress.city,
                        order.shippingAddress.state,
                        order.shippingAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  <p>
                    <b>Total:</b> Rs {order.total}
                  </p>
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}
                    >
                      • {item.qty} × {item.product?.name} — Rs {item.price}
                      <button
                        onClick={() => handleOrderDone(order._id, item._id)}
                        style={{
                          marginLeft: "10px",
                          background: "#28a745",
                          color: "#fff",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Done
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )
          ) : completedOrders.length === 0 ? (
            <p>No completed orders.</p>
          ) : (
            completedOrders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  background: "#fff",
                }}
              >
                <p>
                  <b>Buyer:</b> {order.buyer?.name} ({order.buyer?.email})
                </p>
                <p>
                  <b>Total:</b> Rs {order.total}
                </p>
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}
                  >
                    • {item.qty} × {item.product?.name} — Rs {item.price}
                    {item.completedAt && (
                      <span style={{ marginLeft: "10px", color: "#999" }}>
                        (Completed on: {new Date(item.completedAt).toLocaleString()})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Material Pre-Orders */}
      {tab === "materialOrders" && (
  {/* Removed Material Pre-Order Requests section, only using PreOrder Requests */}
      )}

      {/* Profile */}
        {/* PreOrder Requests */}
        <div style={{ marginTop: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h3 style={{ color: "#cc6600", margin: 0 }}>PreOrder Requests</h3>
            <button
              style={{ background: "#e2b455", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
              onClick={fetchPreOrders}
            >
              Refresh
            </button>
          </div>
          {preOrders.length === 0 ? (
            <p>No preorders found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f7e6d3" }}>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Preferred Date</th>
                  <th>Payment Option</th>
                  <th>Supplier Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {preOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{order.materialName}</td>
                    <td>{order.quantity}</td>
                    <td>{order.preferredDate ? new Date(order.preferredDate).toLocaleDateString() : ""}</td>
                    <td>{order.paymentOption === "pay_now" ? "Pay Now" : "Pay Later"}</td>
                    <td>
                      {order.supplierResponse?.accepted ? (
                        <span>Rs {order.supplierResponse.price}</span>
                      ) : <span>-</span>}
                    </td>
                    <td>{order.status}</td>
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
                            onClick={async () => {
                              if (!window.confirm("Are you sure you want to reject this preorder?")) return;
                              try {
                                await API.delete(`/preorder/${order._id}`, {
                                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                });
                                if (typeof setPreOrders === "function") {
                                  setPreOrders(prev => prev.filter(p => p._id !== order._id));
                                }
                              } catch (err) {
                                alert("Error deleting preorder.");
                              }
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
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to cancel this preorder?")) return;
                            try {
                              await API.delete(`/preorder/${order._id}`, {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                              });
                              if (typeof setPreOrders === "function") {
                                setPreOrders(prev => prev.filter(p => p._id !== order._id));
                              }
                            } catch (err) {
                              alert("Error deleting preorder.");
                            }
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
                <p>Amount: Rs {preOrders.find(o => o._id === paymentOrder)?.supplierResponse?.price}</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await API.patch(`/preorder/${paymentOrder}/pay`, {}, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                      });
                      setPaymentOrder(null);
                      fetchPreOrders();
                    } catch (err) {
                      alert("Error processing payment.");
                    }
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <input type="text" placeholder="Card Number" maxLength={16} required style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
                  <input type="text" placeholder="Expiry (MM/YY)" maxLength={5} required style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
                  <input type="text" placeholder="CVV" maxLength={4} required style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
                  <button
                    type="submit"
                    style={{ background: "#4caf50", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer", marginRight: 8 }}
                  >
                    Confirm Payment
                  </button>
                  <button type="button" onClick={() => setPaymentOrder(null)} style={{ background: "#f44336", color: "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}>Cancel</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
      {tab === "profile" && (
        <div>
          <h2>Profile</h2>
          <h3>Edit Profile</h3>
          <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              placeholder="Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Shop Name"
              value={profileForm.shopName}
              onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={profileForm.description}
              onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
            />
            <button onClick={handleProfileUpdate}>Save Profile</button>
          </div>

          <h3>Change Password</h3>
          <div style={{ maxWidth: "400px", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
            />
            <button onClick={handlePasswordChange}>Update Password</button>
          </div>
        </div>
      )}
    </div>
  );
}
