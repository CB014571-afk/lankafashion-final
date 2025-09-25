// components/payment/PaymentReceipt.jsx
import React from 'react';
import { formatCurrency, formatDate } from '../../utils/sellerUtils';

const PaymentReceipt = ({ paymentData, preOrder, onClose, onPrint }) => {
  const receiptData = {
    receiptNumber: `RCP-${Date.now()}`,
    paymentDate: new Date(),
    transactionId: paymentData.paymentIntent?.id || 'N/A',
    amount: paymentData.preOrder?.supplierResponse?.price || preOrder.supplierResponse?.price || 0,
    paymentMethod: 'Credit/Debit Card',
    status: 'Paid'
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', 'PRINT', 'height=600,width=800');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - LankaFashion</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: black;
              background-color: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e2b455;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #e2b455;
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header h2 {
              color: #333;
              margin: 0;
              font-size: 20px;
              font-weight: normal;
            }
            .details-grid {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .detail-section {
              flex: 1;
            }
            .detail-section.right {
              text-align: right;
            }
            .detail-label {
              font-size: 14px;
              color: #666;
              margin: 0;
            }
            .detail-value {
              font-size: 16px;
              font-weight: bold;
              margin: 5px 0;
            }
            .preorder-details {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 30px;
            }
            .preorder-details h3 {
              margin: 0 0 15px 0;
              color: #333;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .payment-summary {
              background-color: #f0f0f0;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 30px;
              border: 2px solid #e2b455;
            }
            .payment-summary h3 {
              margin: 0 0 15px 0;
              color: #333;
            }
            .total-row {
              font-size: 18px;
              font-weight: bold;
              border-top: 1px solid #ccc;
              padding-top: 15px;
              margin-top: 15px;
            }
            .footer {
              border-top: 1px solid #eee;
              padding-top: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LankaFashion</h1>
            <h2>Payment Receipt</h2>
          </div>

          <div class="details-grid">
            <div class="detail-section">
              <p class="detail-label">Receipt Number</p>
              <p class="detail-value">${receiptData.receiptNumber}</p>
            </div>
            <div class="detail-section right">
              <p class="detail-label">Payment Date</p>
              <p class="detail-value">${formatDate(receiptData.paymentDate)}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-section">
              <p class="detail-label">Transaction ID</p>
              <p class="detail-value" style="font-family: monospace; font-size: 12px;">${receiptData.transactionId}</p>
            </div>
            <div class="detail-section right">
              <p class="detail-label">Status</p>
              <p class="detail-value" style="color: green;">${receiptData.status}</p>
            </div>
          </div>

          <div class="preorder-details">
            <h3>Pre-Order Details</h3>
            <div class="detail-row">
              <span><strong>Pre-Order ID:</strong></span>
              <span>#${preOrder._id?.slice(-6) || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span><strong>Material:</strong></span>
              <span>${preOrder.materialName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Quantity:</strong></span>
              <span>${preOrder.quantity}</span>
            </div>
            <div class="detail-row">
              <span><strong>Contact Email:</strong></span>
              <span>${preOrder.email}</span>
            </div>
            <div class="detail-row">
              <span><strong>Phone:</strong></span>
              <span>${preOrder.contactNumber}</span>
            </div>
          </div>

          <div class="payment-summary">
            <h3>Payment Summary</h3>
            <div class="detail-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(receiptData.amount)}</span>
            </div>
            <div class="detail-row">
              <span>Processing Fee:</span>
              <span>Rs 0.00</span>
            </div>
            <div class="detail-row total-row">
              <span>Total Paid:</span>
              <span>${formatCurrency(receiptData.amount)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your payment! Your pre-order has been confirmed.</p>
            <p>For any questions, please contact us at support@lankafashion.com</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Wait a bit for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    onPrint && onPrint();
  };

  return (
    <div 
      className="receipt-container"
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{
        textAlign: 'center',
        borderBottom: '2px solid #e2b455',
        paddingBottom: '20px',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          color: '#e2b455', 
          margin: '0 0 10px 0',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          LankaFashion
        </h1>
        <h2 style={{ 
          color: '#333', 
          margin: '0',
          fontSize: '20px',
          fontWeight: 'normal'
        }}>
          Payment Receipt
        </h2>
      </div>

      {/* Receipt Details */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Receipt Number</p>
            <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>
              {receiptData.receiptNumber}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Payment Date</p>
            <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>
              {formatDate(receiptData.paymentDate)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Transaction ID</p>
            <p style={{ margin: '5px 0', fontSize: '12px', fontFamily: 'monospace' }}>
              {receiptData.transactionId}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Status</p>
            <span style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginTop: '5px'
            }}>
              {receiptData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Pre-Order Details */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Pre-Order Details</h3>
        <div style={{ lineHeight: '1.8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><strong>Pre-Order ID:</strong></span>
            <span>#{preOrder._id?.slice(-6) || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><strong>Material:</strong></span>
            <span>{preOrder.materialName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><strong>Quantity:</strong></span>
            <span>{preOrder.quantity}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><strong>Contact Email:</strong></span>
            <span>{preOrder.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span><strong>Phone:</strong></span>
            <span>{preOrder.contactNumber}</span>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div 
        className="payment-summary"
        style={{
          backgroundColor: '#e2b455',
          color: 'white',
          padding: '20px',
          borderRadius: '6px',
          marginBottom: '30px'
        }}
      >
        <h3 style={{ margin: '0 0 15px 0' }}>Payment Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(receiptData.amount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Processing Fee:</span>
          <span>Rs 0.00</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.3)', margin: '15px 0' }} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          <span>Total Paid:</span>
          <span>{formatCurrency(receiptData.amount)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Payment Method</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            marginRight: '15px'
          }}>
            💳
          </div>
          <div>
            <p style={{ margin: '0', fontWeight: 'bold' }}>{receiptData.paymentMethod}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              Processed securely via Stripe
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #eee',
        paddingTop: '20px',
        textAlign: 'center',
        color: '#666',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Thank you for your payment! Your pre-order has been confirmed.
        </p>
        <p style={{ margin: '0 0 20px 0' }}>
          For any questions, please contact us at support@lankafashion.com
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        <button
          onClick={handlePrint}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🖨️ Print Receipt
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#e2b455',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              margin: 0;
              padding: 20px;
            }
            
            .receipt-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 20px !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background-color: white !important;
              color: black !important;
            }
            
            button {
              display: none !important;
            }
            
            h1, h2, h3 {
              color: black !important;
            }
            
            .payment-summary {
              background-color: #f0f0f0 !important;
              color: black !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentReceipt;