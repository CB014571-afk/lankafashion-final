// Custom hook for shop data management
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useShopData = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shopNames, setShopNames] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { category, shopName } = filters;
      
      if (shopName) {
        try {
          const res = await API.get(`/api/shops/${encodeURIComponent(shopName.trim())}`);
          setProducts(res.data.products || []);
          setShopInfo({
            shopName: res.data.shopName,
            description: res.data.description || "",
            email: res.data.email || "",
            contactNumber: res.data.contactNumber || "",
          });
        } catch (err) {
          if (err.response?.status === 404) {
            setProducts([]);
            setShopInfo(null);
          }
          throw err;
        }
      } else {
        const query = [];
        if (category) query.push(`category=${encodeURIComponent(category)}`);
        
        const endpoint = query.length > 0 ? `/products?${query.join('&')}` : '/products';
        const res = await API.get(endpoint);
        setProducts(Array.isArray(res.data) ? res.data : []);
        setShopInfo(null);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/products/categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchShopNames = async () => {
    try {
      const res = await API.get("/products/shops");
      setShopNames(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching shop names:", err);
      setShopNames([]);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const res = await API.get("/products/best-sellers");
      setBestSellers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching best sellers:", err);
      setBestSellers([]);
    }
  };

  const initializeShop = async () => {
    await Promise.all([
      fetchCategories(),
      fetchShopNames(),
      fetchBestSellers(),
      fetchProducts()
    ]);
  };

  useEffect(() => {
    initializeShop();
  }, []);

  return {
    products,
    categories,
    shopNames,
    bestSellers,
    shopInfo,
    loading,
    error,
    fetchProducts,
    refreshData: initializeShop
  };
};

export const useProductReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/products/${productId}/reviews`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Please login to add a review");
      
      const res = await API.post(`/products/${productId}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReviews(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("Error adding review:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return {
    reviews,
    loading,
    error,
    addReview,
    refreshReviews: fetchReviews
  };
};