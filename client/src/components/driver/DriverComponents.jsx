// Reusable components for driver dashboard
import React from 'react';
import { DRIVER_STYLES, DELIVERY_STATUS, DRIVER_TABS } from '../../constants/driverConstants';
import { 
  formatDeliveryAddress, 
  formatDate, 
  formatTime, 
  getDeliveryPriority,
  getEstimatedDeliveryTime,
  calculateDeliveryTotal,
  formatCurrency
} from '../../utils/driverUtils';

export const LoadingSpinner = ({ message = "Loading deliveries..." }) => (
  <div style={DRIVER_STYLES.loadingContainer}>
    <div style={{ 
      display: 'inline-block',
      width: '30px',
      height: '30px',
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
    padding: '20px', 
    borderRadius: '5px',
    margin: '20px 0',
    textAlign: 'center'
  }}>
    <p>{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        style={{ 
          background: '#c62828', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Try Again
      </button>
    )}
  </div>
);

export const DriverTabNavigation = ({ activeTab, onTabChange, deliveryStats }) => (
  <div style={DRIVER_STYLES.tabContainer}>
    <button
      style={DRIVER_STYLES.tab(activeTab === DRIVER_TABS.PENDING)}
      onClick={() => onTabChange(DRIVER_TABS.PENDING)}
    >
      Pending ({deliveryStats.pending || 0})
    </button>
    <button
      style={DRIVER_STYLES.tab(activeTab === DRIVER_TABS.ACCEPTED)}
      onClick={() => onTabChange(DRIVER_TABS.ACCEPTED)}
    >
      Accepted ({deliveryStats.accepted || 0})
    </button>
    <button
      style={DRIVER_STYLES.tab(activeTab === DRIVER_TABS.COMPLETED)}
      onClick={() => onTabChange(DRIVER_TABS.COMPLETED)}
    >
      Completed ({deliveryStats.completed || 0})
    </button>
  </div>
);

export const DeliveryCard = ({ 
  delivery, 
  onAccept, 
  onMarkComplete, 
  onViewDetails,
  actionLoading = false 
}) => {
  const priority = getDeliveryPriority(delivery);
  const estimatedTime = getEstimatedDeliveryTime(delivery);
  const { orderTotal, deliveryCharge, totalAmount } = calculateDeliveryTotal(delivery);
  
  return (
    <div 
      style={{
        ...DRIVER_STYLES.deliveryCard,
        borderLeft: priority === 'urgent' ? '5px solid #dc3545' : 
                   priority === 'high' ? '5px solid #ffc107' : '5px solid #28a745'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={DRIVER_STYLES.deliveryHeader}>
        <span style={DRIVER_STYLES.deliveryId}>
          Delivery #{delivery._id?.slice(-6) || 'N/A'}
        </span>
        <span style={DRIVER_STYLES.statusBadge(delivery.status)}>
          {delivery.status || 'pending'}
        </span>
      </div>

      <div style={DRIVER_STYLES.deliveryInfo}>
        <p><strong>Customer:</strong> {delivery.name || 'N/A'}</p>
        <p><strong>Phone:</strong> {delivery.phone || 'N/A'}</p>
        <p><strong>Address:</strong> {delivery.address || 'N/A'}</p>
        <p><strong>Estimated Time:</strong> {estimatedTime}</p>
        
        {delivery.specialInstructions && (
          <p><strong>Instructions:</strong> {delivery.specialInstructions}</p>
        )}
        
        {delivery.items && delivery.items.length > 0 && (
          <div>
            <strong>Items:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {delivery.items.slice(0, 3).map((item, index) => (
                <li key={index} style={{ fontSize: '13px' }}>
                  {item.name} x{item.quantity}
                </li>
              ))}
              {delivery.items.length > 3 && (
                <li style={{ fontSize: '13px', fontStyle: 'italic' }}>
                  +{delivery.items.length - 3} more items
                </li>
              )}
            </ul>
          </div>
        )}
        
        {/* Total Cost with Delivery Charge */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '5px', 
          margin: '10px 0',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <p style={{ margin: '0 0 5px 0', color: '#666' }}>
            <strong>Order Total:</strong> {formatCurrency(orderTotal)}
          </p>
          <p style={{ margin: '0 0 5px 0', color: '#666' }}>
            <strong>Delivery Charge:</strong> {formatCurrency(deliveryCharge)}
          </p>
          <hr style={{ margin: '5px 0', border: 'none', borderTop: '1px solid #ddd' }} />
          <p style={{ margin: '0', color: '#e2b455', fontSize: '16px' }}>
            <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
          </p>
        </div>
        
        <p><strong>Created:</strong> {formatDate(delivery.createdAt)} at {formatTime(delivery.createdAt)}</p>
        
        {priority === 'urgent' && (
          <p style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '12px' }}>
            🚨 URGENT DELIVERY
          </p>
        )}
      </div>

      <div style={DRIVER_STYLES.buttonGroup}>
        {delivery.status === DELIVERY_STATUS.PENDING && (
          <button
            style={{
              ...DRIVER_STYLES.actionButton,
              ...DRIVER_STYLES.acceptButton,
              opacity: actionLoading ? 0.6 : 1
            }}
            onClick={() => onAccept(delivery._id)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Accepting...' : 'Accept Delivery'}
          </button>
        )}
        
        {delivery.status === DELIVERY_STATUS.ACCEPTED && (
          <button
            style={{
              ...DRIVER_STYLES.actionButton,
              ...DRIVER_STYLES.completeButton,
              opacity: actionLoading ? 0.6 : 1
            }}
            onClick={() => onMarkComplete(delivery)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Completing...' : 'Mark as Completed'}
          </button>
        )}
        
        <button
          style={{
            ...DRIVER_STYLES.actionButton,
            ...DRIVER_STYLES.viewButton
          }}
          onClick={() => onViewDetails(delivery)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export const DeliveryGrid = ({ 
  deliveries, 
  onAccept, 
  onMarkComplete, 
  onViewDetails,
  actionLoading,
  emptyMessage = "No deliveries found." 
}) => {
  if (deliveries.length === 0) {
    return (
      <div style={DRIVER_STYLES.emptyState}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={DRIVER_STYLES.deliveryGrid}>
      {deliveries.map(delivery => (
        <DeliveryCard
          key={delivery._id}
          delivery={delivery}
          onAccept={onAccept}
          onMarkComplete={onMarkComplete}
          onViewDetails={onViewDetails}
          actionLoading={actionLoading === delivery._id}
        />
      ))}
    </div>
  );
};

export const DeliveryStats = ({ stats }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  }}>
    <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{stats.total}</div>
      <div style={{ fontSize: '14px', color: '#6c757d' }}>Total</div>
    </div>
    <div style={{ textAlign: 'center', padding: '10px', background: '#fff3cd', borderRadius: '8px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{stats.pending}</div>
      <div style={{ fontSize: '14px', color: '#856404' }}>Pending</div>
    </div>
    <div style={{ textAlign: 'center', padding: '10px', background: '#cce5ff', borderRadius: '8px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#004085' }}>{stats.accepted}</div>
      <div style={{ fontSize: '14px', color: '#004085' }}>Accepted</div>
    </div>
    <div style={{ textAlign: 'center', padding: '10px', background: '#d4edda', borderRadius: '8px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{stats.completed}</div>
      <div style={{ fontSize: '14px', color: '#155724' }}>Completed</div>
    </div>
  </div>
);
