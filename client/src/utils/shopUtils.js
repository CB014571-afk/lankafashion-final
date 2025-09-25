// Utility functions for shop and product management
export const formatPrice = (price) => {
  if (!price) return 'Price not available';
  return `Rs ${parseFloat(price).toLocaleString()}`;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

export const validateReviewForm = (reviewData) => {
  const errors = {};
  
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    errors.rating = 'Please provide a rating between 1 and 5 stars';
  }
  
  if (!reviewData.reviewText?.trim()) {
    errors.reviewText = 'Please write a review';
  } else if (reviewData.reviewText.length < 10) {
    errors.reviewText = 'Review must be at least 10 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getProductImageUrl = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return '/placeholder-image.png'; // Fallback image
};

export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(1);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

export const filterProductsBySearch = (products, searchTerm) => {
  if (!searchTerm) return products;
  
  const term = searchTerm.toLowerCase();
  return products.filter(product =>
    product.name?.toLowerCase().includes(term) ||
    product.description?.toLowerCase().includes(term) ||
    product.category?.toLowerCase().includes(term)
  );
};

export const sortProducts = (products, sortBy) => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    default:
      return sorted;
  }
};

export const updateRecentlyViewed = (productId, maxItems = 10) => {
  try {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = viewed.filter(id => id !== productId);
    const updated = [productId, ...filtered].slice(0, maxItems);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating recently viewed:', error);
    return [];
  }
};

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
};