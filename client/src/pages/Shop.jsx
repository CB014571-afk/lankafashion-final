import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddToCartModal from "../components/AddToCartModal"; // make sure path is correct
import "./Shop.css";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shopNames, setShopNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = [];
      if (category) query.push(`category=${category}`);
      const res = await axios.get(
        `http://localhost:5000/api/products/search?${query.join("&")}`
      );
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/meta");
      setCategories(res.data.categories);
      setShopNames(res.data.shopNames);
    } catch (err) {
      console.error("Error fetching meta data", err);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  return (
    <div className="shop-container">
      <h2 className="shop-title">🛍️ Browse Products</h2>

      <div className="filter-bar">
        {/* Shop dropdown navigates to seller profile */}
        <select
          value={shopName}
          onChange={(e) => {
            const selected = e.target.value;
            setShopName(selected);
            if (selected) {
              navigate(`/seller/${selected}`);
            }
          }}
        >
          <option value="">All Shops</option>
          {shopNames.map((name, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Category dropdown filters locally */}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setCategory("");
            setShopName("");
            navigate("/shop"); // reset route
          }}
        >
          Reset
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="product-image"
                />
              )}
              <h3 className="product-title">{product.title}</h3>
              <p>
                <strong>Rs:</strong> {product.price}
              </p>
              <p>
                <strong>Category:</strong> {product.category}
              </p>
              <p>
                <strong>Shop:</strong>{" "}
                {product.shopName || "Unknown"}
              </p>
              <p className="desc">{product.description}</p>
              <div className="btn-wrapper">
                <button
                  className="cart-btn"
                  onClick={() => setSelectedProduct(product)}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <AddToCartModal
          product={{
            name: selectedProduct.title,
            image: selectedProduct.images?.[0],
            shopName: selectedProduct.shopName,
            price: selectedProduct.price,
            _id: selectedProduct._id,
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
