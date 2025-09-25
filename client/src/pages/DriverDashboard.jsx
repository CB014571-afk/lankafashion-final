import React, { useState } from "react";
import { useDriverDeliveries } from "../hooks/useDriverDeliveries";
import { DRIVER_STYLES, DRIVER_TABS } from "../constants/driverConstants";
import { handleDriverError, getDeliveryStats, sortDeliveriesByPriority, calculateDeliveryTotal, formatCurrency } from "../utils/driverUtils";
import {
  LoadingSpinner,
  ErrorMessage,
  DriverTabNavigation,
  DeliveryGrid,
  DeliveryStats
} from "../components/driver/DriverComponents";

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState(DRIVER_TABS.PENDING);
  const [actionLoading, setActionLoading] = useState(null);

  const {
    deliveries,
    loading,
    error,
    acceptDelivery,
    completeDelivery,
    getDeliveriesByStatus,
    refreshDeliveries
  } = useDriverDeliveries();

  const handleAcceptDelivery = async (deliveryId) => {
    try {
      setActionLoading(deliveryId);
      await acceptDelivery(deliveryId);
      alert("Delivery accepted successfully!");
    } catch (err) {
      const errorMessage = handleDriverError(err, "Failed to accept delivery");
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkComplete = async (delivery) => {
    try {
      setActionLoading(delivery._id);
      await completeDelivery(delivery._id);
      alert("Delivery marked as completed successfully!");
    } catch (err) {
      const errorMessage = handleDriverError(err, "Failed to mark delivery as completed");
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (delivery) => {
    // TODO: Implement detailed view modal
    console.log("View details for delivery:", delivery);
    const { orderTotal, deliveryCharge, totalAmount } = calculateDeliveryTotal(delivery);
    
    alert(`Delivery Details:
ID: ${delivery._id}
Customer: ${delivery.name}
Phone: ${delivery.phone}
Address: ${delivery.address}
Status: ${delivery.status}
Order Total: ${formatCurrency(orderTotal)}
Delivery Charge: ${formatCurrency(deliveryCharge)}
Total Amount: ${formatCurrency(totalAmount)}`);
  };

  const handleRetry = () => {
    refreshDeliveries();
  };

  // Get filtered deliveries based on active tab
  const getFilteredDeliveries = () => {
    const statusDeliveries = getDeliveriesByStatus(activeTab);
    return sortDeliveriesByPriority(statusDeliveries);
  };

  // Calculate delivery statistics
  const deliveryStats = getDeliveryStats(deliveries);

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredDeliveries = getFilteredDeliveries();

  return (
    <div style={DRIVER_STYLES.container}>
      <h1 style={DRIVER_STYLES.header}>Driver Dashboard</h1>

      {error && (
        <ErrorMessage message={error} onRetry={handleRetry} />
      )}

      <DeliveryStats stats={deliveryStats} />

      <DriverTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        deliveryStats={deliveryStats}
      />

      <DeliveryGrid
        deliveries={filteredDeliveries}
        onAccept={handleAcceptDelivery}
        onMarkComplete={handleMarkComplete}
        onViewDetails={handleViewDetails}
        actionLoading={actionLoading}
        emptyMessage={
          activeTab === DRIVER_TABS.PENDING 
            ? "No pending deliveries at the moment."
            : activeTab === DRIVER_TABS.ACCEPTED
            ? "No accepted deliveries. Accept some deliveries to see them here."
            : "No completed deliveries yet."
        }
      />
    </div>
  );
}