import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Create a simple working payment form
const SimplePaymentForm = ({ clientSecret, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'Test Customer',
        },
      }
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      setSucceeded(true);
      setProcessing(false);
      console.log('Payment succeeded:', paymentIntent);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  if (succeeded) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="text-green-600 text-2xl mb-2">✅</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-700">Your payment of Rs. {amount} has been processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card information
        </label>
        <div className="p-3 border rounded bg-white">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total:</span>
          <span className="text-lg font-bold">Rs. {amount}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          !stripe || processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {processing ? 'Processing...' : `Pay Rs. ${amount}`}
      </button>

      {/* Test card info */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p className="font-medium text-yellow-800 mb-1">Test Card:</p>
        <p className="text-yellow-700">4242 4242 4242 4242 | 12/25 | 123</p>
      </div>
    </form>
  );
};

const WorkingPaymentPage = () => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(2500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Stripe configuration
    const loadStripeConfig = async () => {
      try {
        const response = await fetch('/api/payment/config');
        const data = await response.json();
        
        if (data.success) {
          setStripePromise(loadStripe(data.data.publishableKey));
        } else {
          throw new Error('Failed to load Stripe config');
        }
      } catch (err) {
        setError('Failed to initialize payment system');
        console.error('Stripe config error:', err);
      }
    };

    loadStripeConfig();
  }, []);

  useEffect(() => {
    if (stripePromise) {
      // Create payment intent
      createPaymentIntent();
    }
  }, [stripePromise]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'lkr',
          orderId: 'test-order-' + Date.now(),
          customerInfo: {
            name: 'Test Customer',
            email: 'test@example.com'
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
        setLoading(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to create payment intent');
      console.error('Payment intent error:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Payment Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Complete Payment</h1>
          
          {stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SimplePaymentForm clientSecret={clientSecret} amount={amount} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkingPaymentPage;