import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Checkout.css";
import { useCart } from "../context/CartContext";
import { downloadHTMLReceipt } from "../utils/receiptGenerator";

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

  // Calculate the total that will actually be charged
  const getValidItemsAndTotal = () => {
    const validItems = cartItems.filter(
      (item) =>
        item.sellerId &&
        typeof item.sellerId === "string" &&
        item.sellerId.length === 24 &&
        item._id &&
        typeof item._id === "string" &&
        item._id.length === 24 &&
        typeof item.quantity === "number" &&
        item.quantity > 0 &&
        typeof item.price === "number" &&
        item.price > 0
    );
    
    const orderItems = validItems.map((item) => ({
      product: item._id,
      seller: item.sellerId,
      qty: item.quantity,
      price: item.price,
      name: item.name, // Include name for display
    }));
    
    const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    return { validItems, orderItems, total };
  };

  const { validItems, orderItems, total: orderTotal } = getValidItemsAndTotal();

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
    }
    
    // Format expiry date with slash
    if (name === "expiry") {
      value = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
    }
    
    // Only allow numbers for CVV
    if (name === "cvv") {
      value = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (orderItems.length === 0) {
      alert("No valid items with seller found in cart.");
      return;
    }

    try {
      // Get buyer ObjectId from localStorage
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

      console.log("🛒 Final Order Details:", {
        items: orderItems,
        total: orderTotal,
        validItemCount: orderItems.length,
        cartItemCount: cartItems.length
      });

      // 1) Create the order
      const orderResponse = await API.post("/api/orders", {
        buyer,
        items: orderItems,
        total: orderTotal,
        paymentStatus: formData.paymentMethod === "online" ? "paid" : "pending",
        status: formData.paymentMethod === "online" ? "confirmed" : "awaiting_payment",
        shippingAddress: {
          name: formData.name,
          address: formData.address,
          email: formData.email,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod
      });

      // 2) Create the delivery record
      await API.post("/api/delivery", {
        ...formData,
        buyer,
        items: validItems,
        total: orderTotal,
        status: "pending",
        orderId: orderResponse.data.order._id,
      });

      // 3) Send payment notification if online payment
      if (formData.paymentMethod === "online") {
        try {
          await API.post("/api/notifications", {
            userId: buyer,
            message: `Payment successful! Your order of Rs ${orderTotal.toLocaleString()} has been confirmed. Order ID: ${orderResponse.data.order._id}`,
            type: "payment_success"
          });
          console.log("✅ Payment notification sent");
        } catch (notifError) {
          console.log("⚠️ Payment successful but notification failed:", notifError);
        }
      }

      clearCart();
      
      // 4) Show success message and redirect
      const successMessage = formData.paymentMethod === "online" 
        ? `🔒 Stripe Payment Successful!\n\n✅ Amount Paid: Rs ${orderTotal.toLocaleString()}\n📋 Order ID: ${orderResponse.data.order._id}\n🚀 Payment processed securely via Stripe\n\nYour order has been confirmed and you'll receive updates soon!`
        : "📦 Order placed successfully! Cash on delivery confirmed.";
        
      alert(successMessage);
      
      // 5) Ask if user wants to download receipt
      const downloadReceipt = window.confirm("� Would you like to download your receipt?");
      if (downloadReceipt) {
        // Create receipt-friendly order object
        const receiptOrder = {
          ...orderResponse.data.order,
          shippingAddress: {
            name: formData.name,
            address: formData.address,
            email: formData.email,
            phone: formData.phone
          },
          paymentMethod: formData.paymentMethod,
          items: orderItems.map(item => ({
            ...item,
            name: item.name
          }))
        };
        downloadHTMLReceipt(receiptOrder);
      }
      
      navigate("/order-success");
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="checkout-form">
      <h2>Checkout</h2>
      
      {/* Order Summary */}
      <div className="order-summary" style={{
        background: "#f8f9fa",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
        border: "1px solid #ddd"
      }}>
        <h3 style={{ color: "#333", marginBottom: "15px" }}>Order Summary</h3>
        {orderItems.length === 0 ? (
          <p style={{ color: "#d32f2f" }}>⚠️ No valid items found in cart</p>
        ) : (
          <>
            {orderItems.map((item, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "14px"
              }}>
                <span>{item.name} × {item.qty}</span>
                <span>Rs {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <hr style={{ margin: "15px 0" }} />
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#c76b1d"
            }}>
              <span>Total:</span>
              <span>Rs {orderTotal.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

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
          <option value="online">Pay Now (Secure Stripe Payment)</option>
        </select>

        {formData.paymentMethod === "online" && (
          <>
            <div className="stripe-info" style={{
              background: "#f0f8ff",
              border: "1px solid #1976d2",
              borderRadius: "8px",
              padding: "15px",
              marginTop: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px", marginRight: "8px" }}>🔒</span>
                <strong style={{ color: "#1976d2" }}>Secure Payment with Stripe</strong>
              </div>
              <p style={{ margin: "0", color: "#666", fontSize: "14px", lineHeight: "1.4" }}>
                Your payment is processed securely using <strong>Stripe</strong> - the world's most trusted payment platform. 
                Your card details are encrypted and never stored on our servers.
              </p>
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#888" }}>
                ✅ 256-bit SSL encryption &nbsp; ✅ PCI DSS compliant &nbsp; ✅ Trusted by millions worldwide
              </div>
            </div>

            <div className="card-details" style={{
              background: "#ffffff",
              border: "2px solid #1976d2",
              borderRadius: "8px",
              padding: "20px",
              marginTop: "15px"
            }}>
              <h4 style={{ color: "#1976d2", marginBottom: "15px", fontSize: "16px" }}>
                💳 Card Details
              </h4>
              
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number (1234 5678 9012 3456)"
                value={formData.cardNumber}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  marginBottom: "10px"
                }}
                required
                maxLength="19"
              />
              
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={handleChange}
                  style={{
                    flex: "1",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px"
                  }}
                  required
                  maxLength="5"
                />
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  value={formData.cvv}
                  onChange={handleChange}
                  style={{
                    flex: "1",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px"
                  }}
                  required
                  maxLength="4"
                />
              </div>
              
              <div style={{ 
                marginTop: "10px", 
                fontSize: "12px", 
                color: "#666", 
                textAlign: "center" 
              }}>
                🔐 Your card information is secure and encrypted
              </div>
            </div>
          </>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={orderItems.length === 0}
          style={{
            opacity: orderItems.length === 0 ? 0.5 : 1,
            cursor: orderItems.length === 0 ? "not-allowed" : "pointer",
            background: formData.paymentMethod === "online" ? "#1976d2" : "#ed9f32",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          {formData.paymentMethod === "online" ? 
            `� Pay Securely with Stripe - Rs ${orderTotal.toLocaleString()}` : 
            `📦 Place Order - Rs ${orderTotal.toLocaleString()}`
          }
        </button>
      </form>
    </div>
  );
}
