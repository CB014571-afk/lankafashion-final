import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./SellerProfile.css";

export default function SellerProfile() {
  const { shopName } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sellers/${shopName}`);
        setSeller(res.data.seller);
        setProducts(res.data.products);
      } catch (err) {
        console.error("Error loading seller profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [shopName]);

  if (loading) return <p className="text-center mt-10">Loading seller profile...</p>;
  if (!seller) return <p className="text-center text-red-500 mt-10">Seller not found.</p>;

  return (
    <div className="seller-container">
      <div className="seller-header">
        <h2>{seller.shopName} – Shop Profile</h2>
      </div>

      <div className="seller-info">
        <p><strong>Design Type:</strong> {seller.designType}</p>
        <p><strong>Description:</strong> {seller.description}</p>
        <p><strong>Contact Email:</strong> {seller.email}</p>
        <p><strong>Custom Size:</strong> {seller.customSize ? "Yes" : "No"}</p>
        <p><strong>On Demand:</strong> {seller.onDemand ? "Yes" : "No"}</p>
        <p><strong>Upload Inspiration:</strong> {seller.uploadInspiration ? "Yes" : "No"}</p>
      </div>

      <h3 className="text-xl font-semibold mb-4 mt-8">🧵 Products by {seller.shopName}</h3>
      <div className="seller-products">
        {products.map((product) => (
          <div className="seller-product-card" key={product._id}>
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.title}
                className="seller-product-image"
              />
            )}
            <h4 className="seller-product-title">{product.title}</h4>
            <p className="seller-product-desc">{product.description}</p>
            <p><strong>Rs:</strong> {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
