// Custom hook for supplier pre-orders
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useSupplierPreOrders = () => {
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [paid, setPaid] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to access supplier features.");
      }

      console.log("🔄 Fetching supplier pre-orders...");

      const [pendingRes, acceptedRes, rejectedRes, paidRes] = await Promise.all([
        API.get("/preorder/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/preorder/accepted", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/preorder/rejected", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        API.get("/preorder/paid", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      console.log("📊 Pre-orders data:", {
        pending: pendingRes.data?.length || 0,
        accepted: acceptedRes.data?.length || 0,
        rejected: rejectedRes.data?.length || 0,
        paid: paidRes.data?.length || 0
      });

      setPending(pendingRes.data || []);
      setAccepted(acceptedRes.data || []);
      setRejected(rejectedRes.data || []);
      setPaid(paidRes.data || []);
    } catch (err) {
      console.error("❌ Error loading preorders:", err);
      setError(err.message || "Error loading preorders");
    } finally {
      setLoading(false);
    }
  };

  const updatePreOrderStatus = async (preorderId, action, additionalData = {}) => {
    try {
      setActionLoading(preorderId);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await API.patch(
        `/preorder/${preorderId}/action`,
        {
          action,
          ...additionalData
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh all data after successful update
      await fetchAllData();
      
      return response.data;
    } catch (err) {
      console.error(`Error ${action}ing preorder:`, err);
      throw new Error(err.response?.data?.message || `Failed to ${action} preorder`);
    } finally {
      setActionLoading('');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    pending,
    accepted,
    rejected,
    paid,
    loading,
    error,
    actionLoading,
    fetchAllData,
    updatePreOrderStatus
  };
};