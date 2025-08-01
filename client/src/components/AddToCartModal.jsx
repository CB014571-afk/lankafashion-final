import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "./AddToCartModal.css";

export default function AddToCartModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [ukSize, setUkSize] = useState("UK 6");
  const [specialRequest, setSpecialRequest] = useState("");
  const { addToCart } = useCart();

  const handleAdd = () => {
    if (!quantity || isNaN(quantity) || quantity < 1) {
      alert("❌ Quantity must be a valid number and at least 1.");
      return;
    }

    addToCart({
      ...product,
      quantity,
      ukSize,
      specialRequest,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Add to Cart</h2>

        <div className="modal-preview">
          {product.image && <img src={product.image} alt={product.name} />}
          <div>
            <p><strong>Product:</strong> {product.name}</p>
            <p><strong>Shop:</strong> {product.shopName}</p>
            <p><strong>Price:</strong> Rs {product.price}</p>
          </div>
        </div>

        <div className="modal-field">
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
          />
        </div>

        <div className="modal-field">
          <label>UK Size:</label>
          <select value={ukSize} onChange={(e) => setUkSize(e.target.value)}>
            <option value="UK 4">Free sizes (choose for sarees / jewelry / handbags)</option>
            <option value="UK 4">UK 4</option>
            <option value="UK 6">UK 6</option>
            <option value="UK 8">UK 8</option>
            <option value="UK 10">UK 10</option>
            <option value="UK 12">UK 12</option>
            <option value="UK 14">UK 14</option>
          </select>
          <small className="modal-hint">Need help? Refer to our UK size chart.</small>
        </div>

        <div className="modal-field">
          <label>Special Request:</label>
          <textarea
            rows="2"
            placeholder="Any custom notes, material, color..."
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
          />
        </div>

        <div className="modal-buttons">
          <button className="btn add" onClick={handleAdd}>Add</button>
          <button className="btn cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
