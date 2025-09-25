// Custom hook for seller profile management
import { useState, useEffect } from 'react';
import API from '../services/api';

export const useSellerProfile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile from localStorage first for quick display
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setProfile(userData);
    } catch (err) {
      console.error("❌ Error loading profile from localStorage:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await API.put("/users/profile", profileData, { headers });
      
      // Update localStorage
      const updatedUser = { ...profile, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfile(updatedUser);
      
      return res.data;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      await API.put("/users/password", passwordData, { headers });
    } catch (err) {
      console.error("Error updating password:", err);
      throw err;
    }
  };

  const getInitialFormData = () => ({
    name: profile?.name || "",
    email: profile?.email || "",
    shopName: profile?.shopName || "",
    description: profile?.description || "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updatePassword,
    getInitialFormData,
    refreshProfile: fetchProfile
  };
};