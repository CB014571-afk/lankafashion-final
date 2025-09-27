// components/payment/PreOrderPaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import paymentService from '../../services/paymentService';

// Load Stripe outside of component render
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not found in environment variables');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

const PreOrderCheckoutForm = ({ preOrder, clientSecret, onPaymentSuccess, onPaymentError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Set payment details for display
    if (preOrder && preOrder.supplierResponse?.price) {
      setPaymentDetails({
        amount: preOrder.supplierResponse.price,
        preOrderDetails: {
          materialName: preOrder.materialName,
          quantity: preOrder.quantity,
          id: preOrder._id
        }
      });
    }
  }, [preOrder]);

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
            billing_details: {
              email: preOrder.email,
            },
          }
        }
      );

      if (error) {
        setPaymentError(error.message);
        onPaymentError && onPaymentError(error);
      } else {
        // Payment succeeded - confirm with backend
        try {
          const confirmResponse = await paymentService.confirmPreOrderPayment(
            paymentIntent.id,
            preOrder._id
          );
          
          if (confirmResponse.success) {
            console.log('Pre-order payment succeeded!', paymentIntent);
            onPaymentSuccess && onPaymentSuccess(paymentIntent, confirmResponse.data);
          } else {
            setPaymentError('Payment confirmation failed');
          }
        } catch (confirmError) {
          setPaymentError('Payment confirmation failed');
          console.error('Payment confirmation error:', confirmError);
        }
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
        color: '#424770',
        fontFamily: '"Helvetica Neue", "Helvetica", sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#aab7c4',
        },
        ':-webkit-autofill': {
          color: '#fce883',
        },
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#fa755a'
      },
      complete: {
        color: '#4caf50',
        iconColor: '#4caf50'
      },
    },
    hidePostalCode: false, // Show postal code like in the Stripe example
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      border: '1px solid #e0e6ed'
    }}>
      {/* Secure Payment Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8fbff',
        borderRadius: '8px',
        border: '1px solid #dbe7fd'
      }}>
        <div style={{ marginRight: '12px', fontSize: '20px' }}>🔒</div>
        <div>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            color: '#1a73e8', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Secure Payment with Stripe
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#5f6368', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            Your payment is processed securely using <strong>Stripe</strong> - the world's most trusted
            payment platform. Your card details are encrypted and never stored on our servers.
          </p>
        </div>
      </div>

      {/* Security Features */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '24px',
        fontSize: '12px',
        color: '#5f6368'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#4caf50', marginRight: '6px' }}>✓</span>
          256-bit SSL encryption
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#4caf50', marginRight: '6px' }}>✓</span>
          PCI DSS compliant
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#4caf50', marginRight: '6px' }}>✓</span>
          Trusted by millions worldwide
        </div>
      </div>
      
      {paymentDetails && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
            Order Summary
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span><strong>Material:</strong></span>
            <span>{paymentDetails.preOrderDetails.materialName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span><strong>Quantity:</strong></span>
            <span>{paymentDetails.preOrderDetails.quantity}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '8px',
            borderTop: '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            <span>Total Amount:</span>
            <span style={{ color: '#1a73e8' }}>Rs {paymentDetails.amount.toFixed(2)}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          padding: '20px',
          border: '2px solid #1a73e8',
          borderRadius: '8px',
          backgroundColor: '#fff',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ marginRight: '12px', fontSize: '18px' }}>💳</div>
            <h4 style={{ 
              margin: 0, 
              color: '#1a73e8', 
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Card Details
            </h4>
          </div>
          
          <div style={{
            padding: '14px',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            backgroundColor: '#fafbfc',
            marginBottom: '12px'
          }}>
            <CardElement options={cardElementOptions} />
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            color: '#5f6368'
          }}>
            <span style={{ marginRight: '6px' }}>🔒</span>
            Your card information is secure and encrypted
          </div>
        </div>

        {paymentError && (
          <div style={{
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid #fecaca'
          }}>
            {paymentError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            style={{
              flex: 1,
              backgroundColor: isLoading ? '#9ca3af' : '#5469d4',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 8px rgba(84, 105, 212, 0.3)',
              ':hover': {
                backgroundColor: '#4c63d2'
              }
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#4c63d2';
            }}
            onMouseOut={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#5469d4';
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Processing...
              </div>
            ) : (
              `Pay Rs ${paymentDetails?.amount.toFixed(2) || '0.00'}`
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              padding: '16px 24px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const PreOrderPaymentForm = ({ preOrder, onPaymentSuccess, onPaymentError, onCancel }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await paymentService.createPreOrderPaymentIntent(
          preOrder._id,
          preOrder.email
        );
        
        if (response.success) {
          setClientSecret(response.data.clientSecret);
        } else {
          setError(response.message);
        }
      } catch (error) {
        setError('Failed to initialize payment');
        console.error('Payment intent creation error:', error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [preOrder]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#666'
      }}>
        Initializing secure payment...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626'
      }}>
        Error: {error}
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading payment form...
      </div>
    );
  }

  const stripeOptions = {
    clientSecret: clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#5469d4',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        borderRadius: '8px'
      }
    }
  };

  return (
    <Elements stripe={getStripe()} options={stripeOptions}>
      <PreOrderCheckoutForm
        preOrder={preOrder}
        clientSecret={clientSecret}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default PreOrderPaymentForm;