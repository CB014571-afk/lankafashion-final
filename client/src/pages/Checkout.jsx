import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.paymentMethod === "cash") {
      alert("You will receive an email confirming your order!");
      navigate("/order-success");

    } else {
      if (!formData.cardNumber || !formData.expiry || !formData.cvv) {
        alert("Please fill in all card details");
        return;
      }
      alert("Payment Successful! You will receive an email.");
     navigate("/order-success");
 
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

        <label><strong>Payment Method:</strong></label>
        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
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

        <button type="submit" className="submit-btn">Place Order</button>
      </form>
    </div>
  );
}
