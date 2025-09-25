// Receipt Generator Utility
export const generateReceipt = (order) => {
  const receiptContent = `
    LANKA FASHION STORE
    ==================
    
    Receipt #: ${order._id}
    Date: ${new Date(order.createdAt).toLocaleDateString()}
    Time: ${new Date(order.createdAt).toLocaleTimeString()}
    
    Customer Information:
    --------------------
    Name: ${order.shippingAddress?.name || 'N/A'}
    Email: ${order.shippingAddress?.email || 'N/A'}
    Phone: ${order.shippingAddress?.phone || 'N/A'}
    Address: ${order.shippingAddress?.address || 'N/A'}
    
    Order Details:
    --------------
    ${order.items?.map((item, index) => 
      `${index + 1}. ${item.product?.name || item.name || 'Item'} 
         Qty: ${item.qty || 1} x Rs ${(item.price || 0).toLocaleString()} = Rs ${((item.qty || 1) * (item.price || 0)).toLocaleString()}`
    ).join('\n    ') || 'No items'}
    
    ==================
    Subtotal: Rs ${(order.total || 0).toLocaleString()}
    Payment Method: ${order.paymentMethod || 'N/A'}
    Payment Status: ${order.paymentStatus || 'N/A'}
    Order Status: ${order.status || 'N/A'}
    ==================
    Total: Rs ${(order.total || 0).toLocaleString()}
    
    Thank you for shopping with Lanka Fashion Store!
    For support, contact: support@lankafashion.com
    
    Generated on: ${new Date().toLocaleString()}
  `;
  
  return receiptContent.trim();
};

export const downloadReceipt = (order) => {
  try {
    const receiptText = generateReceipt(order);
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lanka_Fashion_Receipt_${order._id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log('✅ Receipt downloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error downloading receipt:', error);
    alert('Failed to download receipt. Please try again.');
    return false;
  }
};

export const generateHTMLReceipt = (order) => {
  const receiptHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lanka Fashion Receipt #${order._id}</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; }
        .items { border-collapse: collapse; width: 100%; }
        .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items th { background-color: #f2f2f2; }
        .total { font-size: 18px; font-weight: bold; text-align: right; border-top: 2px solid #000; padding-top: 10px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>LANKA FASHION STORE</h1>
        <p>Official Receipt</p>
      </div>
      
      <div class="section">
        <strong>Receipt #:</strong> ${order._id}<br>
        <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
        <strong>Time:</strong> ${new Date(order.createdAt).toLocaleTimeString()}
      </div>
      
      <div class="section">
        <h3>Customer Information:</h3>
        <strong>Name:</strong> ${order.shippingAddress?.name || 'N/A'}<br>
        <strong>Email:</strong> ${order.shippingAddress?.email || 'N/A'}<br>
        <strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}<br>
        <strong>Address:</strong> ${order.shippingAddress?.address || 'N/A'}
      </div>
      
      <div class="section">
        <h3>Order Details:</h3>
        <table class="items">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.product?.name || item.name || 'Item'}</td>
                <td>${item.qty || 1}</td>
                <td>Rs ${(item.price || 0).toLocaleString()}</td>
                <td>Rs ${((item.qty || 1) * (item.price || 0)).toLocaleString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="5">No items</td></tr>'}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}<br>
        <strong>Payment Status:</strong> ${order.paymentStatus || 'N/A'}<br>
        <strong>Order Status:</strong> ${order.status || 'N/A'}
      </div>
      
      <div class="total">
        Total: Rs ${(order.total || 0).toLocaleString()}
      </div>
      
      <div class="footer">
        <p>Thank you for shopping with Lanka Fashion Store!</p>
        <p>For support, contact: support@lankafashion.com</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
      </div>
    </body>
    </html>
  `;
  
  return receiptHTML;
};

export const downloadHTMLReceipt = (order) => {
  try {
    const receiptHTML = generateHTMLReceipt(order);
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lanka_Fashion_Receipt_${order._id}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log('✅ HTML Receipt downloaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error downloading HTML receipt:', error);
    alert('Failed to download receipt. Please try again.');
    return false;
  }
};