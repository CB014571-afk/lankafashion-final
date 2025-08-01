import React, { useEffect, useState } from "react";
import axios from "axios";

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
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: "",
  });

  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch data
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products/mine", { headers });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/orders/seller-orders", { headers });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/users/profile", { headers });
      setProfile(res.data || {});
      setProfileForm({
        name: res.data?.name || "",
        email: res.data?.email || "",
        shopName: res.data?.shopName || "",
        description: res.data?.description || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile({});
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchOrders(), fetchProfile()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/products/add",
        {
          ...newProduct,
          images: newProduct.images ? newProduct.images.split(",").map((s) => s.trim()) : [],
        },
        { headers }
      );
      alert("Product added!");
      setNewProduct({ name: "", description: "", price: "", category: "", images: "" });
      setTab("store");
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  // Profile Update
  const handleProfileUpdate = async () => {
    try {
      await axios.put("/api/users/profile", profileForm, { headers });
      alert("Profile updated!");
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // Password Change
  const handlePasswordChange = async () => {
    try {
      await axios.put("/api/users/change-password", passwordForm, { headers });
      alert("Password updated!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      alert("Error changing password");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading seller dashboard...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#e2b455" }}>Seller Dashboard</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button style={tabBtn(tab === "store")} onClick={() => setTab("store")}>My Store</button>
        <button style={tabBtn(tab === "add")} onClick={() => setTab("add")}>Add Product</button>
        <button style={tabBtn(tab === "orders")} onClick={() => setTab("orders")}>Orders</button>
        <button style={tabBtn(tab === "profile")} onClick={() => setTab("profile")}>Profile</button>
      </div>

      {/* ---------- My Store ---------- */}
      {tab === "store" && (
        <div>
          <h2>My Store</h2>
          <div style={{ marginBottom: "10px", background: "#fdf5e6", padding: "10px", borderRadius: "8px" }}>
            <p><b>Shop Name:</b> {profile.shopName || "Not set"}</p>
            <p><b>Description:</b> {profile.description || "No description yet"}</p>
            <p><b>Contact Email:</b> {profile.email}</p>
          </div>

          <h3>Products</h3>
          {!Array.isArray(products) || products.length === 0 ? (
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
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#fff",
                    textAlign: "center",
                  }}
                >
                  {p.images && p.images[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      style={{ width: "100%", borderRadius: "5px", height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <h4 style={{ marginTop: "10px" }}>{p.name}</h4>
                  <p>{p.description}</p>
                  <p><b>Price:</b> Rs {p.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- Add Product ---------- */}
      {tab === "add" && (
        <div>
          <h2>Add Product</h2>
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
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
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
              Add Product
            </button>
          </form>
        </div>
      )}

      {/* ---------- Orders ---------- */}
      {tab === "orders" && (
        <div>
          <h2>Orders</h2>
          {!Array.isArray(orders) || orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order) => (
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
                <p><b>Buyer:</b> {order.buyer?.name} ({order.buyer?.email})</p>
                <p><b>Total:</b> Rs {order.total}</p>
                <p><b>Status:</b> {order.status}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---------- Profile ---------- */}
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
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <button onClick={handlePasswordChange}>Update Password</button>
          </div>
        </div>
      )}
    </div>
  );
}
