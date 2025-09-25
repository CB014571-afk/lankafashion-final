// Utility functions for supplier dashboard
export const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString();
};

export const formatCurrency = (amount) => {
  if (!amount) return 'Not specified';
  return `$${parseFloat(amount).toFixed(2)}`;
};

export const getOrderStatusColor = (status) => {
  const statusColors = {
    pending: '#ffa500',
    approved: '#4CAF50',
    rejected: '#f44336',
    completed: '#2196F3'
  };
  return statusColors[status] || '#666';
};

export const validateDecisionForm = (decisionData) => {
  const errors = {};
  
  if (!decisionData.decision) {
    errors.decision = 'Decision is required';
  }
  
  if (decisionData.decision === 'approved' && !decisionData.estimatedDeliveryDate) {
    errors.estimatedDeliveryDate = 'Estimated delivery date is required for approved orders';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
};

export const handleApiError = (error, defaultMessage = "An error occurred") => {
  console.error("API Error:", error);
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};