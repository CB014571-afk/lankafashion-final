// Custom hook for supplier orders
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useSupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await API.get("/supplier/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderDecision = async (orderId, decisionData) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await API.put(
        `/supplier/orders/${orderId}/decision`,
        decisionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh orders after successful update
      await fetchOrders();
      
      return response.data;
    } catch (err) {
      console.error("Error updating order decision:", err);
      throw new Error(err.response?.data?.message || "Failed to update order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderDecision
  };
};