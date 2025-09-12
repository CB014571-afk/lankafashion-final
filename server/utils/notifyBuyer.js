const Notification = require('../models/Notification');
const Delivery = require('../models/Delivery');
const mongoose = require('mongoose');

// Utility to create notification for buyer
async function notifyBuyerOnDeliveryStatus(delivery, status) {
  if (!delivery.buyer) return;
  let message = `Your delivery for order ${delivery._id} is now ${status}.`;
  await Notification.create({
    user: delivery.buyer,
    message,
    read: false
  });
}

module.exports = { notifyBuyerOnDeliveryStatus };
