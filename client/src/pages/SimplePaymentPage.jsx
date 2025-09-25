// Simple Payment Page for Testing
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SimplePaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Complete Your Payment</h1>
      <p>Order ID: {orderId}</p>
      
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '20px', 
        marginTop: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Order Summary</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Product:</strong> Fashion Item
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Quantity:</strong> 1
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Price:</strong> Rs. 2,500.00
        </div>
        <hr style={{ margin: '15px 0' }} />
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          <strong>Total: Rs. 2,500.00</strong>
        </div>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '20px', 
        marginTop: '20px',
        backgroundColor: '#fff'
      }}>
        <h2>Payment Details</h2>
        <p style={{ marginBottom: '15px' }}>Enter your card information below:</p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Card Number
          </label>
          <input 
            type="text" 
            placeholder="4242 4242 4242 4242"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Expiry Date
            </label>
            <input 
              type="text" 
              placeholder="MM/YY"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              CVC
            </label>
            <input 
              type="text" 
              placeholder="123"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            marginTop: '10px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Pay Rs. 2,500.00
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb', 
        borderRadius: '8px', 
        padding: '15px', 
        marginTop: '20px',
        color: '#155724'
      }}>
        <strong>🔒 Secure Payment</strong>
        <p style={{ margin: '5px 0 0 0' }}>
          This is a payment form. In a real implementation, this would be connected to Stripe for secure payment processing.
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        borderRadius: '8px', 
        padding: '15px', 
        marginTop: '15px',
        color: '#856404'
      }}>
        <strong>💳 Test Card Details</strong>
        <p style={{ margin: '5px 0 0 0' }}>
          Card: 4242 4242 4242 4242 | Expiry: 12/25 | CVC: 123
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default SimplePaymentPage;