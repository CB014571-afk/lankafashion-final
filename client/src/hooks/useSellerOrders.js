// Custom hook for seller orders management
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useSellerOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("userId");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    if (!sellerId) {
      console.error("❌ No sellerId in localStorage");
      setError("No seller ID found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [pendingRes, completedRes] = await Promise.all([
        API.get(`/api/orders/seller/${sellerId}`, { headers }),
        API.get(`/api/orders/seller/${sellerId}/completed`, { headers }),
      ]);

      const pendingData = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const completedData = Array.isArray(completedRes.data) ? completedRes.data : [];
      
      console.log("📊 Orders fetched:", {
        pending: pendingData.length,
        completed: completedData.length,
        pendingOrderIds: pendingData.map(o => o._id),
        completedOrderIds: completedData.map(o => o._id)
      });

      setPendingOrders(pendingData);
      setCompletedOrders(completedData);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
      setPendingOrders([]);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const markItemCompleted = async (orderId, itemId) => {
    console.log("🔄 Marking item as completed:", { orderId, itemId });
    
    try {
      console.log("📡 Making API request to:", `/api/orders/${orderId}/item/${itemId}/done`);
      console.log("📡 Headers:", headers);
      
      const response = await API.put(`/api/orders/${orderId}/item/${itemId}/done`, {}, { headers });
      console.log("✅ Item marked as completed successfully:", response.data);
      
      // Refresh orders after successful completion
      console.log("🔄 Refreshing orders after completion...");
      await fetchOrders();
      console.log("✅ Orders refreshed successfully");
      
    } catch (err) {
      console.error("❌ Error marking item completed:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    pendingOrders,
    completedOrders,
    loading,
    error,
    markItemCompleted,
    refreshOrders: fetchOrders
  };
};