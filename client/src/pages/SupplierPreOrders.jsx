import React, { useState } from "react";
import { useSupplierPreOrders } from "../hooks/useSupplierPreOrders";
import { PREORDER_STYLES, PREORDER_ACTIONS } from "../constants/preOrderConstants";
import { handleApiError } from "../utils/supplierUtils";
import { LoadingSpinner, ErrorMessage } from "../components/supplier/SupplierComponents";
import { TabNavigation, PreOrderTable } from "../components/supplier/PreOrderComponents";

export default function SupplierPreOrders() {
  const { 
    pending, 
    accepted, 
    rejected, 
    paid,
    loading, 
    error, 
    actionLoading,
    updatePreOrderStatus 
  } = useSupplierPreOrders();
  
  const [activeTab, setActiveTab] = useState('pending');

  // Handle accepting a pre-order
  const handleAccept = async (preorderId, additionalData) => {
    try {
      await updatePreOrderStatus(preorderId, PREORDER_ACTIONS.ACCEPT, additionalData);
      alert("Pre-order accepted successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to accept pre-order");
      alert(errorMessage);
    }
  };

  // Handle rejecting a pre-order
  const handleReject = async (preorderId) => {
    if (!confirm("Are you sure you want to reject this pre-order?")) {
      return;
    }
    
    try {
      await updatePreOrderStatus(preorderId, PREORDER_ACTIONS.REJECT);
      alert("Pre-order rejected successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to reject pre-order");
      alert(errorMessage);
    }
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'pending':
        return pending;
      case 'accepted':
        return accepted;
      case 'rejected':
        return rejected;
      case 'paid':
        return paid;
      default:
        return [];
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinner message="Loading pre-orders..." />;
  }

  // Render error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  const tabs = [
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'accepted', label: 'Accepted', count: accepted.length },
    { key: 'paid', label: 'Paid', count: paid.length },
    { key: 'rejected', label: 'Rejected', count: rejected.length }
  ];

  return (
    <div style={PREORDER_STYLES.container}>
      <h2>Supplier Pre-Order Requests</h2>
      
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      <PreOrderTable
        preorders={getCurrentTabData()}
        onAccept={handleAccept}
        onReject={handleReject}
        actionLoading={actionLoading}
        showActions={activeTab === 'pending'}
        activeTab={activeTab}
      />
    </div>
  );
}