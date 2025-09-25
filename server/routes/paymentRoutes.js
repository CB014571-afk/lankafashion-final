// routes/paymentRoutes.js
const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const router = express.Router();

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PreOrderRequest = require("../models/PreOrderRequest");

/**
 * POST /api/payment/create-payment-intent
 * Creates a payment intent for processing payments
 */
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", orderId, customerEmail } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount is required and must be greater than 0"
      });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId || "",
        customerEmail: customerEmail || ""
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    console.error("Payment Intent Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message
    });
  }
});

/**
 * POST /api/payment/confirm-payment
 * Confirms a payment and updates order status
 */
router.post("/confirm-payment", async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      orderData 
    } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment Intent ID is required"
      });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Create order in database after successful payment
      let createdOrder = null;
      
      if (orderData) {
        console.log("💾 Creating order after successful payment:", orderData);
        
        const order = new Order({
          buyer: orderData.buyer,
          items: orderData.items.map(item => ({
            product: item.product,
            seller: item.seller,
            qty: item.quantity || item.qty || 1,
            price: item.price,
            name: item.name,
            image: item.image
          })),
          total: orderData.total,
          paymentStatus: "paid",
          status: "processing", // Start with processing status
          shippingAddress: orderData.shippingAddress,
          paymentMethod: "stripe",
          paymentIntentId: paymentIntentId
        });
        
        try {
          createdOrder = await order.save();
          console.log("✅ Order created successfully:", createdOrder._id);
        } catch (orderError) {
          console.error("❌ Error creating order:", orderError);
          // Don't fail the payment confirmation if order creation fails
          // The payment was successful, we just log the order creation error
        }
      }

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: {
          paymentStatus: paymentIntent.status,
          amountReceived: paymentIntent.amount_received / 100,
          orderId: createdOrder?._id || null
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
        data: {
          paymentStatus: paymentIntent.status
        }
      });
    }

  } catch (error) {
    console.error("Payment Confirmation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: error.message
    });
  }
});

/**
 * POST /api/payment/webhook
 * Stripe webhook endpoint for handling payment events
 */
router.post("/webhook", express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      // TODO: Update order status in database
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed!', failedPayment.id);
      // TODO: Handle failed payment
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/payment/config
 * Returns publishable key for client-side Stripe initialization
 */
router.get("/config", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  });
});

/**
 * POST /api/payment/refund
 * Process a refund for a payment
 */
router.post("/refund", async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment Intent ID is required"
      });
    }

    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundData.reason = reason;
    }

    const refund = await stripe.refunds.create(refundData);

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error("Refund Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message
    });
  }
});

/**
 * POST /api/payment/create-preorder-payment-intent
 * Creates a payment intent for pre-order payments
 */
router.post("/create-preorder-payment-intent", async (req, res) => {
  try {
    const { preOrderId, customerEmail } = req.body;

    // Validate required fields
    if (!preOrderId) {
      return res.status(400).json({
        success: false,
        message: "Pre-order ID is required"
      });
    }

    // Find the pre-order
    const preOrder = await PreOrderRequest.findById(preOrderId).populate('sellerId', 'name email');
    
    if (!preOrder) {
      return res.status(404).json({
        success: false,
        message: "Pre-order not found"
      });
    }

    // Check if pre-order is in accepted status and has a price
    if (preOrder.status !== 'accepted' || !preOrder.supplierResponse?.price) {
      return res.status(400).json({
        success: false,
        message: "Pre-order must be accepted by supplier with a quoted price"
      });
    }

    // Check if already paid
    if (preOrder.paid) {
      return res.status(400).json({
        success: false,
        message: "Pre-order is already paid"
      });
    }

    const amount = preOrder.supplierResponse.price;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: "lkr", // Sri Lankan Rupee
      metadata: {
        preOrderId: preOrderId,
        sellerId: preOrder.sellerId._id.toString(),
        materialName: preOrder.materialName,
        customerEmail: customerEmail || preOrder.sellerId.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        preOrderDetails: {
          id: preOrder._id,
          materialName: preOrder.materialName,
          quantity: preOrder.quantity,
          price: preOrder.supplierResponse.price
        }
      }
    });

  } catch (error) {
    console.error("Pre-order Payment Intent Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent for pre-order",
      error: error.message
    });
  }
});

/**
 * POST /api/payment/confirm-preorder-payment
 * Confirms a pre-order payment and updates the pre-order status
 */
router.post("/confirm-preorder-payment", async (req, res) => {
  try {
    const { paymentIntentId, preOrderId } = req.body;

    if (!paymentIntentId || !preOrderId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID and pre-order ID are required"
      });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Get the pre-order with seller details before updating
      const preOrderBeforeUpdate = await PreOrderRequest.findById(preOrderId).populate('sellerId', 'name email');
      
      if (!preOrderBeforeUpdate) {
        return res.status(404).json({
          success: false,
          message: "Pre-order not found"
        });
      }

      // Update the pre-order
      const preOrder = await PreOrderRequest.findByIdAndUpdate(
        preOrderId,
        {
          status: 'paid',
          paid: true,
          paymentDate: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      ).populate('sellerId', 'name email');

      // Create notification for the supplier (seller who accepted the pre-order)
      try {
        const notification = new Notification({
          user: preOrder.sellerId._id,
          message: `Payment received for pre-order: ${preOrder.materialName} (Qty: ${preOrder.quantity}). Amount: Rs ${preOrder.supplierResponse.price.toLocaleString()}.`,
          type: 'payment_received',
          read: false,
          createdAt: new Date()
        });
        
        await notification.save();
        console.log(`📢 Payment notification sent to supplier ${preOrder.sellerId.name} for pre-order ${preOrder._id}`);
      } catch (notificationError) {
        console.error('❌ Failed to create payment notification for supplier:', notificationError);
        // Don't fail the payment confirmation if notification fails
      }

      res.status(200).json({
        success: true,
        message: "Pre-order payment confirmed successfully. Supplier has been notified.",
        data: {
          preOrder: preOrder,
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            status: paymentIntent.status
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not successful",
        paymentStatus: paymentIntent.status
      });
    }

  } catch (error) {
    console.error("Pre-order Payment Confirmation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm pre-order payment",
      error: error.message
    });
  }
});

module.exports = router;