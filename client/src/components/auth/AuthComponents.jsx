// Reusable components for authentication
import React from 'react';
import { Link } from 'react-router-dom';
import { AUTH_STYLES, USER_ROLES } from '../../constants/authConstants';
import { getRoleDisplayName } from '../../utils/authUtils';

export const AuthContainer = ({ children }) => (
  <div style={AUTH_STYLES.container}>
    {children}
  </div>
);

export const AuthHeading = ({ children }) => (
  <h1 style={AUTH_STYLES.heading}>{children}</h1>
);

export const AuthInput = ({ 
  type = "text", 
  value, 
  onChange, 
  placeholder,
  error,
  ...props 
}) => (
  <div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        ...AUTH_STYLES.input,
        borderColor: error ? '#f44336' : '#ccc'
      }}
      {...props}
    />
    {error && (
      <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
        {error}
      </div>
    )}
  </div>
);

export const AuthSelect = ({ value, onChange, error, children, ...props }) => (
  <div>
    <select
      value={value}
      onChange={onChange}
      style={{
        ...AUTH_STYLES.select,
        borderColor: error ? '#f44336' : '#ccc'
      }}
      {...props}
    >
      {children}
    </select>
    {error && (
      <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>
        {error}
      </div>
    )}
  </div>
);

export const AuthButton = ({ children, loading = false, ...props }) => (
  <button
    style={{
      ...AUTH_STYLES.button,
      opacity: loading ? 0.6 : 1,
      cursor: loading ? 'not-allowed' : 'pointer'
    }}
    disabled={loading}
    {...props}
  >
    {loading ? 'Please wait...' : children}
  </button>
);

export const ErrorMessage = ({ message }) => (
  message ? <div style={AUTH_STYLES.error}>{message}</div> : null
);

export const SuccessMessage = ({ message }) => (
  message ? <div style={AUTH_STYLES.success}>{message}</div> : null
);

export const AuthLink = ({ to, children }) => (
  <div style={AUTH_STYLES.linkContainer}>
    <Link to={to} style={AUTH_STYLES.link}>
      {children}
    </Link>
  </div>
);

export const AuthDivider = ({ children }) => (
  <div style={AUTH_STYLES.divider}>{children}</div>
);

export const RoleSelector = ({ value, onChange, error, showSellerFields = false }) => (
  <AuthSelect
    value={value}
    onChange={onChange}
    error={error}
  >
    <option value="">Select Role</option>
    <option value={USER_ROLES.BUYER}>{getRoleDisplayName(USER_ROLES.BUYER)}</option>
    <option value={USER_ROLES.SELLER}>{getRoleDisplayName(USER_ROLES.SELLER)}</option>
    <option value={USER_ROLES.SUPPLIER}>{getRoleDisplayName(USER_ROLES.SUPPLIER)}</option>
    <option value={USER_ROLES.DRIVER}>{getRoleDisplayName(USER_ROLES.DRIVER)}</option>
  </AuthSelect>
);

export const LoadingSpinner = () => (
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
  </div>
);