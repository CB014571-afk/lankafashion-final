// Utility functions for driver dashboard
import { DELIVERY_CHARGE } from '../constants/driverConstants';

export const formatDeliveryAddress = (delivery) => {
  if (!delivery.address) return 'Address not provided';
  
  // Handle both string addresses and object addresses
  if (typeof delivery.address === 'string') {
    return delivery.address;
  }
  
  // Handle object format (for backward compatibility)
  const { addressLine1, addressLine2, city, postalCode, country } = delivery.address;
  const parts = [addressLine1, addressLine2, city, postalCode, country].filter(Boolean);
  return parts.join(', ');
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString();
};

export const formatTime = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleTimeString();
};

export const getDeliveryPriority = (delivery) => {
  if (!delivery.createdAt) return 'normal';
  
  const created = new Date(delivery.createdAt);
  const now = new Date();
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) return 'urgent';
  if (hoursDiff > 12) return 'high';
  return 'normal';
};

export const validateProofData = (proofData) => {
  if (!proofData) {
    return { isValid: false, error: 'Proof image is required' };
  }
  
  // Check if it's a valid data URL
  if (!proofData.startsWith('data:image/')) {
    return { isValid: false, error: 'Invalid image format' };
  }
  
  return { isValid: true };
};

export const handleDriverError = (error, defaultMessage = "An error occurred") => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

export const getEstimatedDeliveryTime = (delivery) => {
  // Simple estimation based on distance/location
  // In a real app, this would use mapping APIs
  if (!delivery.address) return 'To be determined';
  
  // Handle string addresses - try to extract city names
  const address = typeof delivery.address === 'string' ? delivery.address : delivery.address?.city;
  if (!address) return 'To be determined';
  
  const cityDistances = {
    'Colombo': '30-45 minutes',
    'Kandy': '2-3 hours',
    'Galle': '1.5-2 hours',
    'Jaffna': '4-5 hours',
    'Batticaloa': '3-4 hours'
  };
  
  // Check if any city name is mentioned in the address
  for (const [city, time] of Object.entries(cityDistances)) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return time;
    }
  }
  
  return '2-3 weeks';
};

export const sortDeliveriesByPriority = (deliveries) => {
  return [...deliveries].sort((a, b) => {
    const priorityOrder = { urgent: 3, high: 2, normal: 1 };
    const aPriority = priorityOrder[getDeliveryPriority(a)] || 1;
    const bPriority = priorityOrder[getDeliveryPriority(b)] || 1;
    return bPriority - aPriority;
  });
};

export const getDeliveryStats = (deliveries) => {
  const stats = {
    total: deliveries.length,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0
  };
  
  deliveries.forEach(delivery => {
    if (stats.hasOwnProperty(delivery.status)) {
      stats[delivery.status]++;
    }
  });
  
  return stats;
};

export const calculateDeliveryTotal = (delivery) => {
  const orderTotal = delivery.total || 0;
  return {
    orderTotal,
    deliveryCharge: DELIVERY_CHARGE,
    totalAmount: orderTotal + DELIVERY_CHARGE
  };
};

export const formatCurrency = (amount) => {
  return `Rs. ${amount.toFixed(2)}`;
};