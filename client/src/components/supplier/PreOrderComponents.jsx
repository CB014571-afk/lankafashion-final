// Reusable components for pre-orders
import React, { useState } from 'react';
import { PREORDER_STYLES, getStatusColor, PREORDER_ACTIONS } from '../../constants/preOrderConstants';
import { formatDate } from '../../utils/supplierUtils';

export const TabNavigation = ({ activeTab, onTabChange, tabs }) => (
  <div style={PREORDER_STYLES.tabContainer}>
    {tabs.map(tab => (
      <div
        key={tab.key}
        style={{
          ...PREORDER_STYLES.tab,
          ...(activeTab === tab.key ? PREORDER_STYLES.activeTab : {})
        }}
        onClick={() => onTabChange(tab.key)}
      >
        {tab.label} ({tab.count})
      </div>
    ))}
  </div>
);

export const PreOrderTable = ({ 
  preorders, 
  onAccept, 
  onReject, 
  actionLoading,
  showActions = true,
  activeTab = 'pending' 
}) => {
  const [priceInputs, setPriceInputs] = useState({});

  const handlePriceChange = (id, value) => {
    setPriceInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleAccept = (preorder) => {
    const price = priceInputs[preorder._id];
    if (!price || isNaN(parseFloat(price))) {
      alert("Please enter a valid price before accepting.");
      return;
    }
    onAccept(preorder._id, { price: parseFloat(price) });
  };

  if (!preorders.length) {
    return (
      <div style={PREORDER_STYLES.emptyState}>
        No pre-orders found in this category.
      </div>
    );
  }

  return (
    <div style={PREORDER_STYLES.tableContainer}>
      <table style={PREORDER_STYLES.table}>
        <thead>
          <tr>
            <th style={PREORDER_STYLES.tableHeader}>Material</th>
            <th style={PREORDER_STYLES.tableHeader}>Contact</th>
            <th style={PREORDER_STYLES.tableHeader}>Quantity</th>
            <th style={PREORDER_STYLES.tableHeader}>Preferred Date</th>
            <th style={PREORDER_STYLES.tableHeader}>Payment</th>
            <th style={PREORDER_STYLES.tableHeader}>Status</th>
            {showActions && <th style={PREORDER_STYLES.tableHeader}>Price</th>}
            {activeTab === 'paid' && <th style={PREORDER_STYLES.tableHeader}>Payment Info</th>}
            {showActions && <th style={PREORDER_STYLES.tableHeader}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {preorders.map((preorder) => (
            <tr key={preorder._id}>
              <td style={PREORDER_STYLES.tableCell}>
                <strong>{preorder.materialName || 'N/A'}</strong>
              </td>
              <td style={PREORDER_STYLES.tableCell}>
                <div style={{ fontSize: '12px' }}>
                  <div><strong>Email:</strong> {preorder.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {preorder.contactNumber || 'N/A'}</div>
                </div>
              </td>
              <td style={PREORDER_STYLES.tableCell}>{preorder.quantity || 'N/A'}</td>
              <td style={PREORDER_STYLES.tableCell}>
                {formatDate(preorder.preferredDate)}
              </td>
              <td style={PREORDER_STYLES.tableCell}>
                <span style={{ textTransform: 'capitalize' }}>
                  {preorder.paymentOption?.replace('_', ' ') || 'N/A'}
                </span>
              </td>
              <td style={PREORDER_STYLES.tableCell}>
                <span
                  style={{
                    ...PREORDER_STYLES.statusBadge,
                    backgroundColor: getStatusColor(preorder.status),
                    color: 'white'
                  }}
                >
                  {preorder.status || 'pending'}
                </span>
              </td>
              {showActions && (
                <td style={PREORDER_STYLES.tableCell}>
                  {preorder.status === 'pending' && (
                    <input
                      type="number"
                      placeholder="$0.00"
                      value={priceInputs[preorder._id] || ''}
                      onChange={(e) => handlePriceChange(preorder._id, e.target.value)}
                      style={PREORDER_STYLES.priceInput}
                      min="0"
                      step="0.01"
                    />
                  )}
                  {preorder.supplierResponse?.price && (
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      Rs {preorder.supplierResponse.price.toLocaleString()}
                    </span>
                  )}
                </td>
              )}
              {activeTab === 'paid' && (
                <td style={PREORDER_STYLES.tableCell}>
                  <div style={{ fontSize: '12px' }}>
                    <div><strong>Amount:</strong> Rs {preorder.supplierResponse?.price?.toLocaleString() || 'N/A'}</div>
                    <div><strong>Paid on:</strong> {preorder.paymentDate ? new Date(preorder.paymentDate).toLocaleDateString() : 'N/A'}</div>
                    <div style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Payment Received</div>
                  </div>
                </td>
              )}
              {showActions && (
                <td style={PREORDER_STYLES.tableCell}>
                  {preorder.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        onClick={() => handleAccept(preorder)}
                        disabled={actionLoading === preorder._id}
                        style={{
                          ...PREORDER_STYLES.actionButton,
                          ...PREORDER_STYLES.acceptButton,
                          opacity: actionLoading === preorder._id ? 0.6 : 1
                        }}
                      >
                        {actionLoading === preorder._id ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => onReject(preorder._id)}
                        disabled={actionLoading === preorder._id}
                        style={{
                          ...PREORDER_STYLES.actionButton,
                          ...PREORDER_STYLES.rejectButton,
                          opacity: actionLoading === preorder._id ? 0.6 : 1
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {preorder.status !== 'pending' && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {preorder.supplierNotes || 'No action needed'}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};