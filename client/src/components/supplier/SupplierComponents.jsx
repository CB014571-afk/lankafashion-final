// Reusable components for supplier dashboard
import React from 'react';
import { DASHBOARD_STYLES } from '../../constants/supplierConstants';
import { formatDate, formatCurrency, getOrderStatusColor } from '../../utils/supplierUtils';

export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <div style={{ 
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3498db',
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

export const OrderCard = ({ order, onViewDetails }) => (
  <li style={DASHBOARD_STYLES.orderItem}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Material: {order.materialName || 'N/A'}
        </h4>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
          <p><strong>Seller:</strong> {order.sellerId?.name || 'N/A'} 
            {order.sellerId?.shopName && ` (${order.sellerId.shopName})`}
          </p>
          <p><strong>Contact Email:</strong> {order.email || 'N/A'}</p>
          <p><strong>Quantity:</strong> {order.quantity || 'N/A'}</p>
          <p><strong>Preferred Date:</strong> {formatDate(order.preferredDate)}</p>
          <p><strong>Payment Option:</strong> {order.paymentOption || 'N/A'}</p>
          <p><strong>Status:</strong> 
            <span style={{ 
              color: getOrderStatusColor(order.status),
              fontWeight: 'bold',
              marginLeft: '5px'
            }}>
              {order.status || 'pending'}
            </span>
          </p>
          {order.trackingInfo && <p><strong>Tracking Info:</strong> {order.trackingInfo}</p>}
          {order.supplierNotes && <p><strong>Supplier Notes:</strong> {order.supplierNotes}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {order.status === "pending" && (
          <button
            onClick={() => onViewDetails(order)}
            style={DASHBOARD_STYLES.viewButton}
          >
            Review / Decide
          </button>
        )}
        {order.status === "approved" && (
          <button
            onClick={() => {/* TODO: Add mark delivered functionality */}}
            style={{...DASHBOARD_STYLES.viewButton, background: '#4CAF50'}}
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  </li>
);

export const FormInput = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  required = false,
  error,
  ...props 
}) => (
  <div style={DASHBOARD_STYLES.formGroup}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
      {label} {required && <span style={{ color: 'red' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={{
        ...DASHBOARD_STYLES.input,
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

export const FormTextarea = ({ 
  label, 
  value, 
  onChange, 
  required = false,
  error,
  ...props 
}) => (
  <div style={DASHBOARD_STYLES.formGroup}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
      {label} {required && <span style={{ color: 'red' }}>*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      style={{
        ...DASHBOARD_STYLES.textarea,
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

export const FormSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  required = false,
  error,
  ...props 
}) => (
  <div style={DASHBOARD_STYLES.formGroup}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
      {label} {required && <span style={{ color: 'red' }}>*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      style={{
        ...DASHBOARD_STYLES.input,
        borderColor: error ? '#f44336' : '#ccc'
      }}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <span style={{ color: '#f44336', fontSize: '12px', marginTop: '5px', display: 'block' }}>
        {error}
      </span>
    )}
  </div>
);