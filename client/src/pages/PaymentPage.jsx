// pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentForm from '../components/payment/PaymentForm';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading && !orderDetails) {
        console.log('Order loading timeout');
        setError('Unable to load order details. Please try again.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading, orderDetails, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details for:', orderId);
      
      // Use local API URL for development
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Test if backend is accessible first
      try {
        const healthCheck = await fetch(`${apiUrl}/health`, { 
          method: 'GET',
          timeout: 2000 
        });
        console.log('Backend health check:', healthCheck.ok);
      } catch (healthError) {
        console.log('Backend not accessible');
        throw new Error('Backend not accessible');
      }

      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'GET',
        timeout: 3000
      });
      const data = await response.json();

      if (response.ok) {
        setOrderDetails(data.order || data); // Handle different response formats
        console.log('Order loaded successfully:', data);
        setLoading(false); // ✅ ADD THIS LINE!
      } else {
        throw new Error(data.message || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error.message);
      setError('Failed to load order details. Please check the order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Get user information for order
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userObj?._id || localStorage.getItem("userId");
      
      // Prepare order data to send to backend
      const orderData = {
        buyer: userId,
        items: orderDetails.items.map(item => ({
          product: item.product || new Date().getTime().toString(), // Generate ID if missing
          seller: item.seller || userId, // Default to buyer if no seller
          quantity: item.quantity || item.qty || 1,
          price: item.price || 0,
          name: item.name || 'Product',
          image: item.image || '/pics/default.jpg'
        })),
        total: orderDetails.total || paymentIntent.amount_received / 100,
        shippingAddress: {
          street: orderDetails.shippingAddress?.street || '123 Default Street',
          city: orderDetails.shippingAddress?.city || 'Colombo',
          postalCode: orderDetails.shippingAddress?.postalCode || '00100',
          country: orderDetails.shippingAddress?.country || 'Sri Lanka'
        }
      };
      
      console.log('📦 Sending order data:', orderData);
      
      // Confirm payment on backend and create order
      const response = await fetch(`${apiUrl}/api/payment/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          orderData: orderData
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Payment confirmed and order created:', data.data.orderId);
        
        // Redirect to success page with the actual order ID
        const actualOrderId = data.data.orderId || orderId;
        navigate(`/payment-success/${actualOrderId}`, {
          state: { paymentIntent, orderId: actualOrderId }
        });
      } else {
        setError('Payment confirmation failed');
      }
    } catch (error) {
      setError('Payment processing failed');
      console.error('Payment confirmation error:', error);
    }
  };

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed');
    console.error('Payment error:', error);
  };

  const updateOrderPaymentStatus = async (status) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: status,
          ...(status === 'paid' && { status: 'confirmed' })
        }),
      });

      if (!response.ok) {
        console.error('Failed to update order payment status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg max-w-md mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Payment Details</h3>
          <p className="text-gray-600 text-sm">Please wait while we prepare your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h1 className="text-3xl font-bold">
              Complete Your Payment
            </h1>
            <p className="text-blue-100 mt-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Order #{orderDetails._id}
            </p>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Order Summary */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  {orderDetails.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.product?.name || item.productName || `Product ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.qty || item.quantity} × Rs. {item.price?.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800">
                          Rs. {((item.qty || item.quantity) * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t-2 border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        Rs. {orderDetails.total?.toFixed(2) || orderDetails.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Shipping Information
                  </h3>
                  <div className="text-blue-700 space-y-2">
                    {orderDetails.shippingAddress?.name && (
                      <p><strong>Name:</strong> {orderDetails.shippingAddress.name}</p>
                    )}
                    {orderDetails.shippingAddress?.address && (
                      <p><strong>Address:</strong> {orderDetails.shippingAddress.address}</p>
                    )}
                    {orderDetails.shippingAddress?.email && (
                      <p><strong>Email:</strong> {orderDetails.shippingAddress.email}</p>
                    )}
                    {orderDetails.shippingAddress?.phone && (
                      <p><strong>Phone:</strong> {orderDetails.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Details
                </h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700 font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                  <PaymentForm
                    amount={orderDetails.total || orderDetails.totalAmount}
                    orderId={orderDetails._id}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </div>

                {/* Security Information */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="text-green-700">
                      <p className="font-semibold mb-2">🔒 Your payment is secure and encrypted</p>
                      <p className="text-sm">We use Stripe, a leading payment processor trusted by millions worldwide. Your card details are never stored on our servers.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;