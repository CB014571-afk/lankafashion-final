import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSupplierOrders } from "../hooks/useSupplierOrders";
import { 
  DASHBOARD_STYLES, 
  INITIAL_DECISION_DATA, 
  DECISION_OPTIONS 
} from "../constants/supplierConstants";
import { validateDecisionForm, handleApiError } from "../utils/supplierUtils";
import { 
  LoadingSpinner, 
  ErrorMessage, 
  OrderCard, 
  FormInput, 
  FormTextarea, 
  FormSelect 
} from "../components/supplier/SupplierComponents";

export default function SupplierDashboard() {
  const { orders, loading, error, updateOrderDecision } = useSupplierOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [decisionData, setDecisionData] = useState(INITIAL_DECISION_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Handle order selection for detailed view
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDecisionData(INITIAL_DECISION_DATA);
    setFormErrors({});
  };

  // Handle form input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setDecisionData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle decision form submission
  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    // Validate form
    const validation = validateDecisionForm(decisionData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      await updateOrderDecision(selectedOrder._id, decisionData);
      
      // Reset form and close modal
      setSelectedOrder(null);
      setDecisionData(INITIAL_DECISION_DATA);
      setFormErrors({});
      
      alert("Order decision updated successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to update order decision");
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Close modal without saving
  const handleCloseModal = () => {
    setSelectedOrder(null);
    setDecisionData(INITIAL_DECISION_DATA);
    setFormErrors({});
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  // Render error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={DASHBOARD_STYLES.container}>
      <div style={DASHBOARD_STYLES.header}>
        <h2>Supplier Dashboard - Pending Material Orders</h2>
        <Link to="/supplier-preorders" style={DASHBOARD_STYLES.preOrderButton}>
          View Pre-Order Requests
        </Link>
      </div>

      {!orders.length ? (
        <p>No pending orders assigned to you at the moment.</p>
      ) : (
        <ul style={DASHBOARD_STYLES.orderList}>
          {orders.map((order) => (
            <OrderCard 
              key={order._id} 
              order={order} 
              onViewDetails={handleViewOrderDetails} 
            />
          ))}
        </ul>
      )}

      {selectedOrder && (
        <div style={DASHBOARD_STYLES.modalOverlay}>
          <form onSubmit={handleDecisionSubmit} style={DASHBOARD_STYLES.modal}>
            <h3>Review Order: {selectedOrder.materialName || 'N/A'}</h3>
            <p><strong>Seller Email:</strong> {selectedOrder.email || 'N/A'}</p>

            <FormSelect
              label="Decision"
              value={decisionData.decision}
              onChange={handleInputChange('decision')}
              options={[
                { value: DECISION_OPTIONS.APPROVED, label: 'Approve' },
                { value: DECISION_OPTIONS.REJECTED, label: 'Reject' }
              ]}
              required
              error={formErrors.decision}
            />

            <FormInput
              label="Estimated Delivery Date"
              type="date"
              value={decisionData.estimatedDeliveryDate}
              onChange={handleInputChange('estimatedDeliveryDate')}
              required={decisionData.decision === DECISION_OPTIONS.APPROVED}
              error={formErrors.estimatedDeliveryDate}
            />

            <FormTextarea
              label="Supplier Notes"
              value={decisionData.supplierNotes}
              onChange={handleInputChange('supplierNotes')}
              placeholder="Add any notes for the seller..."
              rows={3}
              error={formErrors.supplierNotes}
            />

            <FormInput
              label="Tracking Info"
              value={decisionData.trackingInfo}
              onChange={handleInputChange('trackingInfo')}
              placeholder="Shipment tracking number, courier etc."
              error={formErrors.trackingInfo}
            />

            <div style={DASHBOARD_STYLES.buttonGroup}>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  ...DASHBOARD_STYLES.submitButton,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Decision'}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                style={{
                  ...DASHBOARD_STYLES.cancelButton,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}