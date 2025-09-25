// components/payment/PaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Load Stripe outside of component render
let stripePromise;

const CheckoutForm = ({ amount, orderId, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'lkr',
          orderId: orderId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setClientSecret(data.data.clientSecret);
      } else {
        setPaymentError(data.message);
      }
    } catch (error) {
      setPaymentError('Failed to initialize payment');
      console.error('Payment intent creation error:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    const card = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card,
          }
        }
      );

      if (error) {
        setPaymentError(error.message);
        onPaymentError && onPaymentError(error);
      } else {
        // Payment succeeded
        console.log('Payment succeeded!', paymentIntent);
        onPaymentSuccess && onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      setPaymentError('Payment processing failed');
      onPaymentError && onPaymentError(error);
    }

    setIsLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: '"Inter", "system-ui", sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#6366f1',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Card Details
        </label>
        <div className="p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-blue-300 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">{paymentError}</span>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            Rs. {amount?.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading || !clientSecret}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
          isLoading || !stripe || !clientSecret
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Pay Rs. {amount?.toFixed(2)}</span>
          </div>
        )}
      </button>

      {/* Test Card Information */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">💳 Test Card Details:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Card Number:</strong> 4242 4242 4242 4242</p>
          <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
          <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
        </div>
      </div>
    </form>
  );
};

const PaymentForm = ({ amount, orderId, onPaymentSuccess, onPaymentError }) => {
  const [stripeKey, setStripeKey] = useState(null);

  useEffect(() => {
    // Fetch Stripe publishable key
    const fetchStripeConfig = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/payment/config`);
        const data = await response.json();
        
        if (data.success) {
          setStripeKey(data.data.publishableKey);
          stripePromise = loadStripe(data.data.publishableKey);
        }
      } catch (error) {
        console.error('Failed to fetch Stripe config:', error);
      }
    };

    fetchStripeConfig();
  }, []);

  if (!stripeKey) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading payment form...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Elements stripe={stripePromise}>
        <CheckoutForm
          amount={amount}
          orderId={orderId}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      </Elements>
    </div>
  );
};

export default PaymentForm;