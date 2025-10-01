// Authentication utility functions
export const validateLoginForm = (formData) => {
  const errors = {};
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegisterForm = (formData) => {
  const errors = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (!formData.role) {
    errors.role = 'Role is required';
  }
  
  // Seller-specific validation
  if (formData.role === 'seller') {
    if (!formData.shopName?.trim()) {
      errors.shopName = 'Shop name is required for sellers';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const handleAuthError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.status === 401) {
    return 'Invalid email or password';
  }
  if (error.response?.status === 409) {
    return 'User already exists with this email';
  }
  if (error.message) {
    return error.message;
  }
  return 'An error occurred during authentication';
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    buyer: 'Buyer',
    seller: 'Seller',
    supplier: 'Supplier',
    admin: 'Admin',
    driver: 'Driver'
  };
  return roleNames[role] || role;
};

export const getRedirectPath = (userRole) => {
  const routes = {
    seller: '/seller',
    supplier: '/supplier-preorders',
    admin: '/',
    driver: '/driver-dashboard',
    buyer: '/'
  };
  return routes[userRole] || '/';
};