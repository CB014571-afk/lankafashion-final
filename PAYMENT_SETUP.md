# Payment Gateway Integration Guide

## Overview
This payment gateway integration uses Stripe to process payments securely. The implementation includes both backend API endpoints and frontend React components.

## Setup Instructions

### 1. Backend Setup (Server)

#### Install Dependencies
```bash
cd server
npm install stripe uuid
```

#### Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Other existing variables...
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

#### Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Navigate to API Keys section
4. Copy your test keys (for development):
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

### 2. Frontend Setup (Client)

#### Install Dependencies
```bash
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## API Endpoints

The following payment endpoints are available:

### POST `/api/payment/create-payment-intent`
Creates a payment intent for processing payments.

**Request Body:**
```json
{
  "amount": 29.99,
  "currency": "usd",
  "orderId": "order_123",
  "customerEmail": "customer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

### POST `/api/payment/confirm-payment`
Confirms a payment after it's completed.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

### GET `/api/payment/config`
Returns the publishable key for client-side Stripe initialization.

### POST `/api/payment/refund`
Processes a refund for a payment.

## Frontend Components

### PaymentForm Component
A React component that handles the payment form and Stripe integration.

**Usage:**
```jsx
import PaymentForm from '../components/payment/PaymentForm';

<PaymentForm
  amount={29.99}
  orderId="order_123"
  onPaymentSuccess={(paymentIntent) => {
    // Handle successful payment
    console.log('Payment successful:', paymentIntent);
  }}
  onPaymentError={(error) => {
    // Handle payment error
    console.error('Payment failed:', error);
  }}
/>
```

### PaymentPage Component
A complete payment page that fetches order details and handles the payment flow.

**Route:** `/payment/:orderId`

### PaymentSuccessPage Component
A success page shown after successful payment.

**Route:** `/payment-success/:orderId`

## Integration Flow

1. **Order Creation**: Create an order in your system
2. **Redirect to Payment**: Navigate to `/payment/:orderId`
3. **Payment Processing**: User enters payment details and submits
4. **Payment Confirmation**: Backend confirms the payment with Stripe
5. **Order Update**: Update order status to "paid" and "confirmed"
6. **Success Page**: Show payment success page

## Testing

### Test Card Numbers (Stripe Test Mode)
- **Successful payment**: 4242 4242 4242 4242
- **Declined payment**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

Use any future expiry date, any 3-digit CVC, and any postal code.

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Validate payments** on the backend before fulfilling orders
3. **Use webhook endpoints** for reliable payment status updates
4. **Implement proper error handling** for payment failures
5. **Log payment events** for auditing and troubleshooting

## Webhook Setup (Production)

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to your `.env` file

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Make sure all dependencies are installed
2. **CORS issues**: Ensure your frontend domain is allowed in CORS settings
3. **Stripe key errors**: Verify your Stripe keys are correct and for the right environment
4. **Payment not completing**: Check browser console for JavaScript errors

### Debug Mode
Set `NODE_ENV=development` to enable additional logging.

## Production Deployment

1. Replace test Stripe keys with live keys
2. Set up webhook endpoints
3. Enable proper SSL/HTTPS
4. Configure production environment variables
5. Test thoroughly with small amounts first

## Support

For Stripe-specific issues, refer to [Stripe Documentation](https://stripe.com/docs).
For implementation questions, check the code comments in the payment routes and components.