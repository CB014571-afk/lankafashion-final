import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import SellerProfile from "./pages/SellerProfile";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PreOrderRequest from "./pages/PreOrderRequest";
import SellerOrders from "./pages/SellerOrders";
import BuyerOrders from "./pages/BuyerOrders";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// 👉 Add this import (create it if you don't have it yet)
import SellerDashboard from "./pages/SellerDashboard";

const ProtectedRoute = ({ children, allow }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
};

export default function Router() {
  return (
    <Routes>
      {/* Public / Buyer */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/seller/:shopName" element={<SellerProfile />} />
      <Route path="/buyer-orders" element={
        <ProtectedRoute allow={["buyer"]}>
          <BuyerOrders />
        </ProtectedRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Seller-only */}
      <Route path="/seller" element={
        <ProtectedRoute allow={["seller"]}>
          <SellerDashboard />
        </ProtectedRoute>
      } />

      {/* Keep your old seller pages if you still navigate to them directly */}
      <Route path="/seller-orders" element={
        <ProtectedRoute allow={["seller"]}>
          <SellerOrders />
        </ProtectedRoute>
      } />
      <Route path="/preorder" element={
        <ProtectedRoute allow={["seller"]}>
          <PreOrderRequest />
        </ProtectedRoute>
      } />

      {/* Redirect old links to the dashboard */}
      <Route path="/my-store" element={<Navigate to="/seller" replace />} />
      <Route path="/add-product" element={<Navigate to="/seller" replace />} />
      <Route path="/profile" element={<Navigate to="/seller" replace />} />

      {/* 404 */}
      <Route path="*" element={<div style={{ padding: 20 }}>Page Not Found</div>} />
    </Routes>
  );
}
