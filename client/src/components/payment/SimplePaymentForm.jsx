// Simple Payment Form with guaranteed visible button
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

let stripePromise;

const SimpleCheckoutForm = ({ amount, orderId, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount || 11500,
          currency: 'lkr',
          orderId: orderId || 'test123',
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
      console.error('Payment error:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      alert('Stripe not loaded yet. Please wait and try again.');
      return;
    }

    if (!clientSecret) {
      alert('Payment not initialized. Please refresh and try again.');
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    const card = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: card }
      });

      if (error) {
        setPaymentError(error.message);
        alert('Payment failed: ' + error.message);
        onPaymentError && onPaymentError(error);
      } else {
        alert('Payment successful! Payment ID: ' + paymentIntent.id);
        onPaymentSuccess && onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      setPaymentError('Payment processing failed');
      alert('Payment processing failed: ' + error.message);
      onPaymentError && onPaymentError(error);
    }

    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Payment Details</h3>
        
        {/* Card Element */}
        <div style={{
          padding: '15px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#fff'
        }}>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#333',
                '::placeholder': { color: '#999' }
              }
            }
          }} />
        </div>

        {/* Error Display */}
        {paymentError && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            color: '#800',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {paymentError}
          </div>
        )}

        {/* Amount Display */}
        <div style={{
          background: '#f0f8ff',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong style={{ fontSize: '18px', color: '#333' }}>
            Total: Rs. {(amount || 11500).toFixed(2)}
          </strong>
        </div>

        {/* BIG VISIBLE PAY BUTTON */}
        <button
          type="submit"
          disabled={!stripe || isLoading || !clientSecret}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: (!stripe || isLoading || !clientSecret) ? '#ccc' : '#007bff',
            border: 'none',
            borderRadius: '8px',
            cursor: (!stripe || isLoading || !clientSecret) ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {isLoading ? 'Processing Payment...' : `💳 PAY Rs. ${(amount || 11500).toFixed(2)}`}
        </button>

        {/* Test Card Info */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>Test Card:</strong><br/>
          Card: 4242 4242 4242 4242<br/>
          Expiry: 12/25<br/>
          CVC: 123
        </div>

        {/* Debug Info */}
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>Stripe loaded: {stripe ? '✅' : '❌'}</p>
          <p>Client Secret: {clientSecret ? '✅' : '❌'}</p>
          <p>Amount: Rs. {(amount || 11500).toFixed(2)}</p>
        </div>
      </form>
    </div>
  );
};

const SimplePaymentForm = ({ amount, orderId, onPaymentSuccess, onPaymentError }) => {
  const [stripeKey, setStripeKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStripeConfig = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/payment/config');
        const data = await response.json();
        
        if (data.success) {
          setStripeKey(data.data.publishableKey);
          stripePromise = loadStripe(data.data.publishableKey);
        } else {
          console.error('Failed to get Stripe key:', data);
        }
      } catch (error) {
        console.error('Stripe config error:', error);
      }
      setLoading(false);
    };

    fetchStripeConfig();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading payment system...</div>
      </div>
    );
  }

  if (!stripeKey) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <div>Failed to load payment system</div>
        <button onClick={() => window.location.reload()} style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <SimpleCheckoutForm
        amount={amount}
        orderId={orderId}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default SimplePaymentForm;