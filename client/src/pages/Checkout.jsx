import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";
import API from "../api";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    paymentMethod: "cash",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    try {
      // Get buyer ObjectId from context or localStorage
      let buyer = null;
      try {
        const userObj = JSON.parse(localStorage.getItem("user"));
        buyer = userObj?._id || localStorage.getItem("userId");
      } catch {
        buyer = localStorage.getItem("userId");
      }
      if (!buyer || buyer.length !== 24) {
        alert("Invalid buyer ID. Please log in again.");
        return;
      }
      const items = cartItems
        .filter(
          (item) =>
            item.sellerId &&
            typeof item.sellerId === "string" &&
            item.sellerId.length === 24 &&
            item._id && typeof item._id === "string" && item._id.length === 24 &&
            typeof item.quantity === "number" && item.quantity > 0 &&
            typeof item.price === "number" && item.price > 0
        )
        .map((item) => ({
          product: item._id,
          seller: item.sellerId,
          qty: item.quantity,
          price: item.price,
        }));
      if (items.length === 0) {
        alert("No valid items with seller found in cart.");
        return;
      }
      const orderTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      console.log("Calculated total:", orderTotal);
      console.log("Items to be ordered:", items);
      
      try {
        // First create the order
        const orderResponse = await API.post("/orders", {
          buyer,
          items,
          total: orderTotal
        });
        console.log("Order created:", orderResponse.data);

        // Then create the delivery record
        const deliveryResponse = await API.post("/delivery", {
          ...formData,
          buyer,
          items,
          total: orderTotal,
          status: "pending",
          orderId: orderResponse.data.order._id
        });
        console.log("Delivery created:", deliveryResponse.data);
      } catch (error) {
        console.error("Error details:", error.response?.data || error.message);
        throw error; // Re-throw to be caught by the outer catch block
      }

      clearCart();
      alert("Order placed successfully! You will receive an email confirming your order.");
      navigate("/order-success");
    } catch (err) {
      alert("Failed to place order. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="checkout-form">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Delivery Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label>
          <strong>Payment Method:</strong>
        </label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="cash">Cash on Delivery</option>
          <option value="card">Card Payment</option>
        </select>

        {formData.paymentMethod === "card" && (
          <>
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="expiry"
              placeholder="Expiry (MM/YY)"
              value={formData.expiry}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={formData.cvv}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit" className="submit-btn">
          Place Order
        </button>
      </form>
    </div>
  );
}
