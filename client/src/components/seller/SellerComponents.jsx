// Reusable components for seller dashboard
import React from 'react';
import { SELLER_STYLES, TABS, ORDER_TABS } from '../../constants/sellerConstants';
import { formatCurrency, formatDate, truncateText, calculateUnitPrice } from '../../utils/sellerUtils';

export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <div style={{ 
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #e2b455',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p>{message}</p>
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div style={{ 
    background: '#ffebee', 
    color: '#c62828', 
    padding: '15px', 
    borderRadius: '5px',
    margin: '10px 0'
  }}>
    <p>{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        style={{ 
          background: '#c62828', 
          color: 'white', 
          border: 'none', 
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Retry
      </button>
    )}
  </div>
);

export const TabNavigation = ({ activeTab, onTabChange, editingProductId }) => (
  <div style={SELLER_STYLES.tabContainer}>
    <button 
      style={SELLER_STYLES.tabButton(activeTab === TABS.STORE)} 
      onClick={() => onTabChange(TABS.STORE)}
    >
      My Store
    </button>
    <button 
      style={SELLER_STYLES.tabButton(activeTab === TABS.ADD)} 
      onClick={() => onTabChange(TABS.ADD)}
    >
      {editingProductId ? "Edit Product" : "Add Product"}
    </button>
    <button 
      style={SELLER_STYLES.tabButton(activeTab === TABS.ORDERS)} 
      onClick={() => onTabChange(TABS.ORDERS)}
    >
      Orders
    </button>
    <button 
      style={SELLER_STYLES.tabButton(activeTab === TABS.PRE_ORDERS)} 
      onClick={() => onTabChange(TABS.PRE_ORDERS)}
    >
      Pre-Orders
    </button>
    <button 
      style={SELLER_STYLES.tabButton(activeTab === TABS.PROFILE)} 
      onClick={() => onTabChange(TABS.PROFILE)}
    >
      Profile
    </button>
  </div>
);

export const StoreInfo = ({ profile }) => (
  <div style={SELLER_STYLES.storeInfo}>
    <p><b>Shop Name:</b> {profile.shopName || "Not set"}</p>
    <p><b>Description:</b> {profile.description || "No description yet"}</p>
    <p><b>Contact Email:</b> {profile.email}</p>
  </div>
);

export const ProductCard = ({ product, onEdit, onDelete }) => (
  <div style={SELLER_STYLES.productCard}>
    {product.images?.[0] && (
      <img
        src={product.images[0]}
        alt={product.name}
        style={SELLER_STYLES.productImage}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    )}
    <div style={SELLER_STYLES.productContent}>
      <h4>{product.name}</h4>
      <p>{truncateText(product.description, 80)}</p>
      <p><b>{formatCurrency(product.price)}</b></p>
      <div style={SELLER_STYLES.buttonGroup}>
        <button
          style={SELLER_STYLES.editButton}
          onClick={() => onEdit(product)}
        >
          Edit
        </button>
        <button
          style={SELLER_STYLES.deleteButton}
          onClick={() => onDelete(product._id)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export const OrderTabNavigation = ({ activeTab, onTabChange, pendingCount, completedCount }) => (
  <div style={{ marginBottom: "20px" }}>
    <button
      style={SELLER_STYLES.orderTabButton(activeTab === ORDER_TABS.PENDING)}
      onClick={() => onTabChange(ORDER_TABS.PENDING)}
    >
      Pending Orders ({pendingCount})
    </button>
    <button
      style={SELLER_STYLES.orderTabButton(activeTab === ORDER_TABS.COMPLETED)}
      onClick={() => onTabChange(ORDER_TABS.COMPLETED)}
    >
      Completed Orders ({completedCount})
    </button>
  </div>
);

export const OrderCard = ({ order, onMarkCompleted, showCompleteButton = true }) => (
  <div style={SELLER_STYLES.orderCard}>
    <div style={{ marginBottom: "15px", paddingBottom: "10px", borderBottom: "2px solid #e2b455" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <p style={{ margin: "0", fontSize: "16px" }}><b>Buyer:</b> {order.buyer?.name} ({order.buyer?.email})</p>
        <div style={{ display: "flex", gap: "10px" }}>
          {order.status && (
            <span style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: order.status === 'delivered' ? '#d4edda' : 
                               order.status === 'shipped' ? '#cce5ff' : 
                               order.status === 'processing' ? '#fff3cd' : '#f8d7da',
              color: order.status === 'delivered' ? '#155724' : 
                     order.status === 'shipped' ? '#004085' : 
                     order.status === 'processing' ? '#856404' : '#721c24'
            }}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          )}
          {order.paymentStatus && (
            <span style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: order.paymentStatus === 'paid' ? '#d4edda' : 
                               order.paymentStatus === 'pending' ? '#fff3cd' : '#f8d7da',
              color: order.paymentStatus === 'paid' ? '#155724' : 
                     order.paymentStatus === 'pending' ? '#856404' : '#721c24'
            }}>
              {order.paymentStatus.toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
        <b>Order Date:</b> {formatDate(order.createdAt || new Date())}
      </p>
    </div>

    <div style={{ marginBottom: "15px" }}>
      <p style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: "bold", color: "#333" }}>Order Items:</p>
      {order.items.map((item, index) => (
        <div key={item._id} style={{ 
          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
          padding: "12px",
          marginBottom: "8px",
          borderRadius: "6px",
          border: "1px solid #e0e0e0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                {item.product?.name || "Product Name Not Available"}
              </p>
              <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                <span><b>Quantity:</b> {item.qty}</span>
                {item.ukSize && <span><b>UK Size:</b> {item.ukSize}</span>}
              </div>
              {item.specialRequest && (
                <div style={{ 
                  backgroundColor: "#f8f9fa", 
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  margin: "10px 0",
                  fontSize: "13px",
                  lineHeight: "1.4"
                }}>
                  <span style={{ color: "#ff9800" }}>⭐</span> <b>Special Request:</b> {item.specialRequest}
                </div>
              )}
              {item.product?.description && (
                <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#888", fontStyle: "italic" }}>
                  {item.product.description.length > 60 
                    ? item.product.description.substring(0, 60) + "..." 
                    : item.product.description}
                </p>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
              {showCompleteButton && !item.completedAt && (
                <button
                  onClick={() => onMarkCompleted(order._id, item._id)}
                  style={{
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Mark Complete
                </button>
              )}
              {item.completedAt && (
                <div style={{ 
                  backgroundColor: "#d4edda", 
                  color: "#155724", 
                  padding: "4px 8px", 
                  borderRadius: "3px",
                  fontSize: "11px",
                  fontWeight: "bold"
                }}>
                  ✓ Completed
                </div>
              )}
              {item.completedAt && (
                <span style={{ fontSize: "10px", color: "#999" }}>
                  {formatDate(item.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ 
      padding: "10px", 
      backgroundColor: "#e2b455", 
      color: "white", 
      borderRadius: "5px",
      textAlign: "right"
    }}>
      <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
        Order Total: {formatCurrency(order.total)}
      </p>
      <p style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: "0.9" }}>
        {order.items.length} item{order.items.length !== 1 ? 's' : ''} • 
        {order.items.reduce((sum, item) => sum + item.qty, 0)} total quantity
      </p>
    </div>
  </div>
);

export const PreOrderCard = ({ preOrder, onPayNow }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffa726';
      case 'accepted': return '#66bb6a';
      case 'rejected': return '#ef5350';
      case 'paid': return '#42a5f5';
      case 'delivered': return '#26a69a';
      case 'overdue': return '#ff7043';
      case 'cancelled': return '#78909c';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending Supplier Response';
      case 'accepted': return 'Accepted by Supplier';
      case 'rejected': return 'Rejected by Supplier';
      case 'paid': return 'Payment Completed';
      case 'delivered': return 'Delivered';
      case 'overdue': return 'Payment Overdue';
      case 'cancelled': return 'Cancelled';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      margin: '10px 0',
      backgroundColor: '#fafafa'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: 0 }}>Pre-Order #{preOrder._id?.slice(-6) || 'Unknown'}</h4>
        <span 
          style={{
            backgroundColor: getStatusColor(preOrder.status),
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {getStatusText(preOrder.status)}
        </span>
      </div>
      
      <div style={{ lineHeight: '1.6' }}>
        <p><strong>Material:</strong> {preOrder.materialName}</p>
        <p><strong>Quantity:</strong> {preOrder.quantity}</p>
        <p><strong>Contact:</strong> {preOrder.email}</p>
        <p><strong>Phone:</strong> {preOrder.contactNumber}</p>
        <p><strong>Preferred Date:</strong> {formatDate(preOrder.preferredDate)}</p>
        <p><strong>Payment Option:</strong> {preOrder.paymentOption === 'pay_now' ? 'Pay Now' : 'Pay Later'}</p>
        
        {preOrder.supplierResponse?.price && (
          <p><strong>Quoted Price:</strong> {formatCurrency(preOrder.supplierResponse.price)}</p>
        )}
        
        {preOrder.supplierNotes && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <strong>Supplier Notes:</strong>
            <p style={{ margin: '5px 0 0 0' }}>{preOrder.supplierNotes}</p>
          </div>
        )}
        
        {preOrder.paymentDueDate && preOrder.status !== 'paid' && (
          <p><strong>Payment Due:</strong> {formatDate(preOrder.paymentDueDate)}</p>
        )}
        
        {preOrder.status === 'delivered' && preOrder.paymentDate && (
          <p><strong>Payment Date:</strong> {formatDate(preOrder.paymentDate)}</p>
        )}
      </div>
      
      {/* Payment Action Button */}
      {preOrder.status === 'accepted' && !preOrder.paid && preOrder.supplierResponse?.price && onPayNow && (
        <div style={{ marginTop: '15px', textAlign: 'right' }}>
          <button
            onClick={() => onPayNow(preOrder)}
            style={{
              backgroundColor: preOrder.paymentOption === 'pay_later' ? '#FFC107' : '#4CAF50',
              color: preOrder.paymentOption === 'pay_later' ? '#333' : 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (preOrder.paymentOption === 'pay_later') {
                e.target.style.backgroundColor = '#FFB300';
              } else {
                e.target.style.backgroundColor = '#45a049';
              }
            }}
            onMouseLeave={(e) => {
              if (preOrder.paymentOption === 'pay_later') {
                e.target.style.backgroundColor = '#FFC107';
              } else {
                e.target.style.backgroundColor = '#4CAF50';
              }
            }}
          >
            {preOrder.paymentOption === 'pay_now' ? 'Pay Now' : 'Pay Later'} - {formatCurrency(preOrder.supplierResponse.price)}
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <div>Created: {formatDate(preOrder.createdAt)}</div>
        {preOrder.updatedAt !== preOrder.createdAt && (
          <div>Updated: {formatDate(preOrder.updatedAt)}</div>
        )}
      </div>
    </div>
  );
};

export const FormInput = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  required = false,
  error,
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div style={SELLER_STYLES.formGroup}>
      <label style={SELLER_STYLES.label} htmlFor={inputId}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        style={{
          ...SELLER_STYLES.input,
          borderColor: error ? '#f44336' : '#ccc'
        }}
        {...props}
      />
      {error && (
        <span style={{ color: '#f44336', fontSize: '12px', marginTop: '5px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export const FormTextarea = ({ 
  label, 
  value, 
  onChange, 
  required = false,
  error,
  id,
  ...props 
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div style={SELLER_STYLES.formGroup}>
      <label style={SELLER_STYLES.label} htmlFor={textareaId}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        style={{
          ...SELLER_STYLES.textarea,
          borderColor: error ? '#f44336' : '#ccc'
        }}
        {...props}
      />
      {error && (
        <span style={{ color: '#f44336', fontSize: '12px', marginTop: '5px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};