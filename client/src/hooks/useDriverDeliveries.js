// Custom hook for driver deliveries management
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useDriverDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching deliveries...");
      const res = await API.get("/api/delivery");
      
      console.log("Fetched deliveries:", {
        count: res.data.length,
        deliveries: res.data.map(d => ({
          id: d._id,
          status: d.status,
          name: d.name
        }))
      });
      
      setDeliveries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch deliveries:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || "Failed to load deliveries");
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const acceptDelivery = async (deliveryId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await API.patch(
        `/delivery/${deliveryId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setDeliveries(prev => prev.map(delivery => 
        delivery._id === deliveryId 
          ? { ...delivery, status: 'accepted' }
          : delivery
      ));

      return res.data;
    } catch (err) {
      console.error("Error accepting delivery:", err);
      throw err;
    }
  };

  const completeDelivery = async (deliveryId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await API.put(
        `/api/delivery/${deliveryId}/status`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setDeliveries(prev => prev.map(delivery => 
        delivery._id === deliveryId 
          ? { ...delivery, status: 'completed' }
          : delivery
      ));

      return res.data;
    } catch (err) {
      console.error("Error completing delivery:", err);
      throw err;
    }
  };

  const getDeliveriesByStatus = (status) => {
    return deliveries.filter(delivery => delivery.status === status);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return {
    deliveries,
    loading,
    error,
    acceptDelivery,
    completeDelivery,
    getDeliveriesByStatus,
    refreshDeliveries: fetchDeliveries
  };
};