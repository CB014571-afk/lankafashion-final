import React, { useState, useEffect } from "react";
import { useSellerProducts } from "../hooks/useSellerProducts";
import { useSellerOrders } from "../hooks/useSellerOrders";
import { useSellerMaterialOrders } from "../hooks/useSellerMaterialOrders";
import { useSellerProfile } from "../hooks/useSellerProfile";
import { 
  SELLER_STYLES, 
  TABS, 
  ORDER_TABS,
  INITIAL_PRODUCT_DATA,
  INITIAL_PASSWORD_DATA 
} from "../constants/sellerConstants";
import { 
  validateProductForm, 
  validateProfileForm, 
  validatePasswordForm,
  handleApiError,
  prepareProductData 
} from "../utils/sellerUtils";
import { 
  LoadingSpinner,
  ErrorMessage,
  TabNavigation,
  StoreInfo,
  ProductCard,
  OrderTabNavigation,
  OrderCard,
  PreOrderCard,
  FormInput,
  FormTextarea
} from "../components/seller/SellerComponents";
import PreOrderPaymentForm from "../components/payment/PreOrderPaymentForm";
import PaymentReceipt from "../components/payment/PaymentReceipt";

export default function SellerDashboard() {
  const [tab, setTab] = useState(TABS.STORE);
  const [orderTab, setOrderTab] = useState(ORDER_TABS.PENDING);
  const [preOrderStatusFilter, setPreOrderStatusFilter] = useState('all');
  const [newProduct, setNewProduct] = useState(INITIAL_PRODUCT_DATA);
  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_DATA);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPreOrder, setSelectedPreOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentReceiptData, setPaymentReceiptData] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Custom hooks
  const { 
    products, 
    loading: productsLoading,
    error: productsError,
    editingProductId,
    setEditingProductId,
    addProduct,
    updateProduct,
    deleteProduct 
  } = useSellerProducts();

  const { 
    pendingOrders, 
    completedOrders,
    loading: ordersLoading,
    error: ordersError,
    markItemCompleted 
  } = useSellerOrders();

  const { 
    materialOrders, 
    preOrders,
    loading: materialLoading,
    error: materialError 
  } = useSellerMaterialOrders();

  const { 
    profile,
    loading: profileLoading,
    error: profileError,
    updateProfile,
    updatePassword,
    getInitialFormData 
  } = useSellerProfile();

  // Authentication check
  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("userId");

  useEffect(() => {
    if (!sellerId || !token) {
      window.location.href = "/login";
    }
  }, [sellerId, token]);

  // Initialize profile form when profile loads
  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setProfileForm(getInitialFormData());
    }
  }, [profile]);

  // Product form handlers
  const handleProductInputChange = (field) => (e) => {
    const value = e.target.value;
    setNewProduct(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateProductForm(newProduct);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const productData = prepareProductData(newProduct);
      
      if (editingProductId) {
        await updateProduct(editingProductId, productData);
        alert("Product updated successfully!");
        setEditingProductId(null);
      } else {
        await addProduct(productData);
        alert("Product added successfully!");
      }
      
      setNewProduct(INITIAL_PRODUCT_DATA);
      setFormErrors({});
      setTab(TABS.STORE);
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to save product");
      alert(errorMessage);
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category || "",
      images: product.images ? product.images.join(", ") : "",
    });
    setEditingProductId(product._id);
    setTab(TABS.ADD);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProduct(productId);
      alert("Product deleted successfully!");
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to delete product");
      alert(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setNewProduct(INITIAL_PRODUCT_DATA);
    setEditingProductId(null);
    setFormErrors({});
    setTab(TABS.STORE);
  };

  // Profile form handlers
  const handleProfileInputChange = (field) => (e) => {
    const value = e.target.value;
    setProfileForm(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateProfileForm(profileForm);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      await updateProfile(profileForm);
      setFormErrors({});
      alert("Profile updated successfully!");
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to update profile");
      alert(errorMessage);
    }
  };

  // Password form handlers
  const handlePasswordInputChange = (field) => (e) => {
    const value = e.target.value;
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validatePasswordForm(passwordForm);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      await updatePassword(passwordForm);
      setPasswordForm(INITIAL_PASSWORD_DATA);
      setFormErrors({});
      alert("Password updated successfully!");
    } catch (err) {
      const errorMessage = handleApiError(err, "Failed to update password");
      alert(errorMessage);
    }
  };

  // Order handlers
  const handleMarkItemCompleted = async (orderId, itemId) => {
    console.log("🔄 SellerDashboard: Marking item completed", { orderId, itemId });
    
    try {
      await markItemCompleted(orderId, itemId);
      alert("Item marked as completed!");
    } catch (err) {
      console.error("❌ SellerDashboard: Error marking item completed:", err);
      const errorMessage = handleApiError(err, "Failed to mark item as completed");
      alert(errorMessage);
    }
  };

  // Pre-order payment handlers
  const handlePayNow = (preOrder) => {
    setSelectedPreOrder(preOrder);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (paymentIntent, paymentData) => {
    try {
      setShowPaymentForm(false);
      
      // Store receipt data
      setPaymentReceiptData({
        paymentIntent,
        preOrder: paymentData.preOrder,
        paymentData
      });
      
      // Show receipt
      setShowReceipt(true);
      
      // Don't close the selected pre-order yet - we'll do it when receipt is closed
    } catch (err) {
      console.error("Payment success handling error:", err);
      alert("Payment was successful but there was an error updating the display. Please refresh the page.");
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    alert("Payment failed. Please try again.");
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setSelectedPreOrder(null);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setSelectedPreOrder(null);
    setPaymentReceiptData(null);
    // Refresh to update the pre-order status
    window.location.reload();
  };

  const handlePrintReceipt = () => {
    console.log("Receipt printed");
  };

  // Loading state
  if (productsLoading || ordersLoading || materialLoading || profileLoading) {
    return <LoadingSpinner message="Loading seller dashboard..." />;
  }

  return (
    <div style={SELLER_STYLES.container}>
      <h1 style={SELLER_STYLES.header}>Seller Dashboard</h1>

      <TabNavigation 
        activeTab={tab} 
        onTabChange={setTab} 
        editingProductId={editingProductId}
      />

      {/* Store Tab */}
      {tab === TABS.STORE && (
        <div>
          <h2>My Store</h2>
          <StoreInfo profile={profile} />

          <h3>Products</h3>
          {productsError && <ErrorMessage message={productsError} />}
          
          {products.length === 0 ? (
            <p>No products added yet.</p>
          ) : (
            <div style={SELLER_STYLES.productGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Product Tab */}
      {tab === TABS.ADD && (
        <div style={SELLER_STYLES.formContainer}>
          <h2>{editingProductId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleProductSubmit}>
            <FormInput
              label="Product Name"
              value={newProduct.name}
              onChange={handleProductInputChange('name')}
              required
              error={formErrors.name}
            />

            <FormTextarea
              label="Description"
              value={newProduct.description}
              onChange={handleProductInputChange('description')}
              required
              error={formErrors.description}
            />

            <FormInput
              label="Price (Rs)"
              type="number"
              value={newProduct.price}
              onChange={handleProductInputChange('price')}
              required
              error={formErrors.price}
              min="0"
              step="0.01"
            />

            <FormInput
              label="Category"
              value={newProduct.category}
              onChange={handleProductInputChange('category')}
              required
              error={formErrors.category}
            />

            <FormInput
              label="Images (comma-separated URLs)"
              value={newProduct.images}
              onChange={handleProductInputChange('images')}
              placeholder="http://example.com/image1.jpg, http://example.com/image2.jpg"
            />

            <div style={SELLER_STYLES.buttonGroup}>
              <button type="submit" style={SELLER_STYLES.submitButton}>
                {editingProductId ? "Update Product" : "Add Product"}
              </button>
              {editingProductId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  style={SELLER_STYLES.cancelButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Orders Tab */}
      {tab === TABS.ORDERS && (
        <div>
          <h2>Orders</h2>
          {ordersError && <ErrorMessage message={ordersError} />}
          
          <OrderTabNavigation 
            activeTab={orderTab}
            onTabChange={setOrderTab}
            pendingCount={pendingOrders.length}
            completedCount={completedOrders.length}
          />

          {orderTab === ORDER_TABS.PENDING ? (
            pendingOrders.length === 0 ? (
              <p>No pending orders.</p>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onMarkCompleted={handleMarkItemCompleted}
                  showCompleteButton={true}
                />
              ))
            )
          ) : (
            completedOrders.length === 0 ? (
              <p>No completed orders.</p>
            ) : (
              completedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onMarkCompleted={handleMarkItemCompleted}
                  showCompleteButton={false}
                />
              ))
            )
          )}
        </div>
      )}

      {/* Pre-Orders Tab */}
      {tab === TABS.PRE_ORDERS && (
        <div>
          <h2>Pre-Orders</h2>
          {materialError && <ErrorMessage message={materialError} />}
          
          {materialLoading ? (
            <LoadingSpinner message="Loading pre-orders..." />
          ) : preOrders.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#666',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '1px dashed #ccc'
            }}>
              <h3>No Pre-Orders Yet</h3>
              <p>You haven't submitted any pre-orders for materials.</p>
              <p>When you need materials from suppliers, create a pre-order request and track its status here.</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong>Total Pre-Orders: {preOrders.length}</strong>
                  <select 
                    value={preOrderStatusFilter} 
                    onChange={(e) => setPreOrderStatusFilter(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="paid">Paid</option>
                    <option value="delivered">Delivered</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Active: {preOrders.filter(po => ['pending', 'accepted', 'paid'].includes(po.status)).length} | 
                  Completed: {preOrders.filter(po => po.status === 'delivered').length} | 
                  Others: {preOrders.filter(po => ['rejected', 'cancelled', 'overdue'].includes(po.status)).length}
                </div>
              </div>
              
              {(() => {
                const filteredPreOrders = preOrderStatusFilter === 'all' 
                  ? preOrders 
                  : preOrders.filter(po => po.status === preOrderStatusFilter);
                
                return filteredPreOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No pre-orders with status "{preOrderStatusFilter}"
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                      Showing {filteredPreOrders.length} of {preOrders.length} pre-orders
                      {preOrderStatusFilter !== 'all' && ` with status "${preOrderStatusFilter}"`}
                    </p>
                    {filteredPreOrders.map((preOrder) => (
                      <PreOrderCard
                        key={preOrder._id}
                        preOrder={preOrder}
                        onPayNow={handlePayNow}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {tab === TABS.PROFILE && (
        <div style={SELLER_STYLES.formContainer}>
          <h2>Profile</h2>
          {profileError && <ErrorMessage message={profileError} />}
          
          <h3>Edit Profile</h3>
          <form onSubmit={handleProfileSubmit}>
            <FormInput
              label="Name"
              value={profileForm.name}
              onChange={handleProfileInputChange('name')}
              required
              error={formErrors.name}
            />

            <FormInput
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileInputChange('email')}
              required
              error={formErrors.email}
            />

            <FormInput
              label="Shop Name"
              value={profileForm.shopName}
              onChange={handleProfileInputChange('shopName')}
            />

            <FormTextarea
              label="Shop Description"
              value={profileForm.description}
              onChange={handleProfileInputChange('description')}
            />

            <button type="submit" style={SELLER_STYLES.submitButton}>
              Update Profile
            </button>
          </form>

          <h3 style={{ marginTop: "30px" }}>Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <FormInput
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordInputChange('currentPassword')}
              required
              error={formErrors.currentPassword}
            />

            <FormInput
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordInputChange('newPassword')}
              required
              error={formErrors.newPassword}
            />

            <button type="submit" style={SELLER_STYLES.submitButton}>
              Update Password
            </button>
          </form>
        </div>
      )}
      
      {/* Payment Form Modal */}
      {showPaymentForm && selectedPreOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <PreOrderPaymentForm
              preOrder={selectedPreOrder}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancelPayment}
            />
          </div>
        </div>
      )}
      
      {/* Payment Receipt Modal */}
      {showReceipt && selectedPreOrder && paymentReceiptData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <PaymentReceipt
              paymentData={paymentReceiptData}
              preOrder={selectedPreOrder}
              onClose={handleCloseReceipt}
              onPrint={handlePrintReceipt}
            />
          </div>
        </div>
      )}
    </div>
  );
}