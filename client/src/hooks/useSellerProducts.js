// Custom hook for seller products management
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useSellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await API.get("/api/products/mine", { headers });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    try {
      const res = await API.post("/api/products/add", productData, { headers });
      setProducts(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error adding product:", err);
      throw err;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const res = await API.put(`/api/products/${productId}`, productData, { headers });
      setProducts(prev => prev.map(p => p._id === productId ? res.data : p));
      return res.data;
    } catch (err) {
      console.error("Error updating product:", err);
      throw err;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await API.delete(`/api/products/${productId}`, { headers });
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    editingProductId,
    setEditingProductId,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
};