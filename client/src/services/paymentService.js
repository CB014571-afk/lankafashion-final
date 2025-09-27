// services/paymentService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const paymentService = {
  // Get Stripe configuration
  getStripeConfig: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/config`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create payment intent
  createPaymentIntent: async (paymentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/create-payment-intent`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/confirm-payment`, {
        paymentIntentId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process refund
  processRefund: async (refundData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/refund`, refundData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create payment intent for pre-orders
  createPreOrderPaymentIntent: async (preOrderId, customerEmail) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/create-preorder-payment-intent`, {
        preOrderId,
        customerEmail
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Confirm pre-order payment
  confirmPreOrderPayment: async (paymentIntentId, preOrderId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/confirm-preorder-payment`, {
        paymentIntentId,
        preOrderId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default paymentService;