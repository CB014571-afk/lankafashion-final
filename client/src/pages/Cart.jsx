import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. <Link to="/shop">Go shopping →</Link></p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-card">
              <h4>{item.name}</h4>
              <p><strong>Price:</strong> Rs {item.price}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>UK Size:</strong> {item.ukSize}</p>
              <p><strong>Special Request:</strong> {item.specialRequest || "None"}</p>
              <p><strong>Subtotal:</strong> Rs {item.price * item.quantity}</p>
              <button onClick={() => removeFromCart(index)} className="remove-btn">Remove</button>
            </div>
          ))}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="cart-summary">
          <h3>Total: Rs {total}</h3>
          <Link to="/checkout">
            <button className="checkout-btn">Checkout</button>
          </Link>
        </div>
      )}
    </div>
  );
}
