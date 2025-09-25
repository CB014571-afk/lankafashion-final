// Custom hook for seller material orders and pre-orders
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useSellerMaterialOrders = () => {
  const [materialOrders, setMaterialOrders] = useState([]);
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("userId");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMaterialOrders = async () => {
    if (!sellerId) {
      console.error("❌ No sellerId in localStorage");
      return;
    }
    try {
      const res = await API.get(`/material-orders/seller/${sellerId}`, { headers });
      setMaterialOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching material orders:", err);
      setMaterialOrders([]);
    }
  };

  const fetchPreOrders = async () => {
    if (!sellerId) {
      console.error("❌ No sellerId in localStorage");
      return;
    }
    try {
      const res = await API.get(`/preorder/seller/${sellerId}`, { headers });
      setPreOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching preorders:", err);
      setPreOrders([]);
    }
  };

  const fetchAllMaterialData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchMaterialOrders(), fetchPreOrders()]);
    } catch (err) {
      setError(err.message || "Failed to load material data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMaterialData();
  }, []);

  return {
    materialOrders,
    preOrders,
    loading,
    error,
    refreshMaterialData: fetchAllMaterialData
  };
};