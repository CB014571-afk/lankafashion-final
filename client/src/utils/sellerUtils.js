// Utility functions for seller dashboard
export const validateProductForm = (productData) => {
  const errors = {};
  
  if (!productData.name?.trim()) {
    errors.name = 'Product name is required';
  }
  
  if (!productData.description?.trim()) {
    errors.description = 'Description is required';
  }
  
  if (!productData.price || isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
    errors.price = 'Valid price is required';
  }
  
  if (!productData.category?.trim()) {
    errors.category = 'Category is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProfileForm = (profileData) => {
  const errors = {};
  
  if (!profileData.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!profileData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    errors.email = 'Valid email is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePasswordForm = (passwordData) => {
  const errors = {};
  
  if (!passwordData.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  if (!passwordData.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (passwordData.newPassword.length < 6) {
    errors.newPassword = 'New password must be at least 6 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rs 0.00';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Rs 0.00';
  return `Rs ${num.toFixed(2)}`;
};

export const calculateUnitPrice = (totalPrice, quantity) => {
  if (!totalPrice || !quantity || quantity === 0) return 0;
  return parseFloat(totalPrice) / parseInt(quantity);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString();
};

export const handleApiError = (error, defaultMessage = "An error occurred") => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

export const getOrderStatusStyle = (status) => {
  const statusStyles = {
    pending: { background: '#fff3cd', color: '#856404' },
    completed: { background: '#d4edda', color: '#155724' },
    cancelled: { background: '#f8d7da', color: '#721c24' }
  };
  
  return statusStyles[status] || statusStyles.pending;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const prepareProductData = (formData) => {
  return {
    ...formData,
    price: parseFloat(formData.price),
    images: formData.images ? formData.images.split(',').map(img => img.trim()) : []
  };
};