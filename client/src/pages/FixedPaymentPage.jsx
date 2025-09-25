// Fixed PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimplePaymentForm from '../components/payment/SimplePaymentForm';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/orders/${orderId}`);
        const data = await response.json();
        setOrderDetails(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);

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
          product: item.product || new Date().getTime().toString(),
          seller: item.seller || userId,
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
        const actualOrderId = data.data.orderId || orderId;
        console.log('✅ Payment confirmed and order created:', actualOrderId);
        
        alert('Payment successful! Order created with ID: ' + actualOrderId);
        navigate('/order-success'); // Navigate to order success page
      } else {
        alert('Payment confirmation failed');
      }
    } catch (error) {
      alert('Payment processing failed: ' + error.message);
    }
  };

  const handlePaymentError = (error) => {
    alert('Payment failed: ' + error.message);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          textAlign: 'center', 
          background: 'white', 
          padding: '30px', 
          borderRadius: '15px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Loading Payment Details</h3>
          <p style={{ margin: '0', color: '#666' }}>Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
          <div style={{ 
            background: '#fee', 
            border: '1px solid #fcc', 
            color: '#800', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Error</h3>
            <p style={{ margin: '0' }}>{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Order not found</p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 0'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '30px',
            color: 'white'
          }}>
            <h1 style={{ 
              margin: '0 0 10px 0',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}>
              Complete Your Payment
            </h1>
            <p style={{ 
              margin: '0',
              opacity: '0.9',
              fontSize: '1.1rem'
            }}>
              ✓ Order #{orderDetails._id}
            </p>
          </div>

          <div style={{ padding: '40px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '40px'
            }}>
              {/* Order Summary */}
              <div>
                <h2 style={{ 
                  fontSize: '1.8rem',
                  marginBottom: '20px',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  📋 Order Summary
                </h2>
                
                <div style={{ 
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '25px'
                }}>
                  {orderDetails.items?.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '15px',
                      marginBottom: '15px',
                      borderBottom: index < orderDetails.items.length - 1 ? '1px solid #dee2e6' : 'none'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          margin: '0 0 5px 0',
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '1.1rem'
                        }}>
                          {item.product?.name || item.productName || `Product ${index + 1}`}
                        </p>
                        <p style={{ 
                          margin: '0',
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>
                          Quantity: {item.qty || item.quantity} × Rs. {item.price?.toFixed(2)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                          margin: '0',
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          color: '#333'
                        }}>
                          Rs. {((item.qty || item.quantity) * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ 
                    paddingTop: '20px',
                    borderTop: '2px solid #667eea'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: '#333'
                      }}>
                        Total Amount:
                      </span>
                      <span style={{ 
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#667eea'
                      }}>
                        Rs. {orderDetails.total?.toFixed(2) || orderDetails.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div style={{ 
                  background: '#e8f4fd',
                  border: '1px solid #bee5eb',
                  borderRadius: '15px',
                  padding: '25px',
                  marginTop: '25px'
                }}>
                  <h3 style={{ 
                    margin: '0 0 15px 0',
                    color: '#0c5460',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    📍 Shipping Information
                  </h3>
                  <div style={{ color: '#0c5460' }}>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Customer:</strong> {orderDetails.buyer?.name || 'N/A'}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Email:</strong> {orderDetails.buyer?.email || 'N/A'}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Address:</strong> {orderDetails.shippingAddress?.street || '123 Main Street'}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>City:</strong> {orderDetails.shippingAddress?.city || 'Colombo'}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Postal Code:</strong> {orderDetails.shippingAddress?.postalCode || '00100'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div>
                <h2 style={{ 
                  fontSize: '1.8rem',
                  marginBottom: '20px',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  💳 Payment Details
                </h2>
                
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: '15px',
                  padding: '25px',
                  border: '2px solid #dee2e6'
                }}>
                  <SimplePaymentForm
                    amount={orderDetails.total || orderDetails.totalAmount}
                    orderId={orderDetails._id}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </div>

                {/* Security Information */}
                <div style={{ 
                  background: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '15px',
                  padding: '25px',
                  marginTop: '25px'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '15px'
                  }}>
                    <div style={{ 
                      fontSize: '1.5rem',
                      color: '#155724'
                    }}>
                      🔒
                    </div>
                    <div style={{ color: '#155724' }}>
                      <p style={{ 
                        margin: '0 0 10px 0',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}>
                        Your payment is secure and encrypted
                      </p>
                      <p style={{ 
                        margin: '0',
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                      }}>
                        We use Stripe, a leading payment processor trusted by millions worldwide. 
                        Your card details are never stored on our servers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;