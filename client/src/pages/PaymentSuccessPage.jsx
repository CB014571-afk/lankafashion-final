// pages/PaymentSuccessPage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const paymentIntent = location.state?.paymentIntent;

  useEffect(() => {
    // Auto redirect to orders page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/orders');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Order ID:</p>
            <p className="text-gray-900 font-mono">{orderId}</p>
          </div>
          
          {paymentIntent && (
            <div className="mt-3 text-sm text-gray-700">
              <p className="font-semibold">Payment ID:</p>
              <p className="text-gray-900 font-mono">{paymentIntent.id}</p>
            </div>
          )}

          {paymentIntent && (
            <div className="mt-3 text-sm text-gray-700">
              <p className="font-semibold">Amount Paid:</p>
              <p className="text-gray-900 font-semibold">
                ${(paymentIntent.amount / 100).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            View My Orders
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
          >
            Continue Shopping
          </button>
        </div>

        {/* Auto Redirect Notice */}
        <p className="mt-6 text-xs text-gray-500">
          You will be automatically redirected to your orders in 5 seconds.
        </p>

        {/* Email Confirmation Notice */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📧 A confirmation email has been sent to your registered email address.
          </p>
        </div>

        {/* Next Steps */}
        <div className="mt-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your order is being prepared</li>
            <li>• You'll receive tracking information soon</li>
            <li>• Estimated delivery: 3-5 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;