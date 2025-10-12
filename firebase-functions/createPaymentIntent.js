const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

// Initialize Stripe with error handling for missing config
let stripe;
try {
  const stripeSecret = functions.config().stripe?.secret;
  if (!stripeSecret) {
    console.error('STRIPE_SECRET_MISSING: Stripe secret key is not configured in Firebase functions config');
  } else {
    stripe = require('stripe')(stripeSecret);
    console.log('Stripe initialized successfully');
  }
} catch (error) {
  console.error('STRIPE_INIT_ERROR:', error.message);
}

exports.createPaymentIntent = functions.https.onRequest((req, res) => {
  // Apply CORS middleware
  cors(req, res, async () => {
    // Set CORS headers explicitly
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      console.log('=== PAYMENT INTENT REQUEST DEBUG ===');
      console.log('Request method:', req.method);
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);
      console.log('Request query:', req.query);
      
      const { amount, registrationId, registrationType } = req.body;

      // Log received parameters for debugging
      console.log('Received parameters:', {
        amount,
        registrationId,
        registrationType,
        amountType: typeof amount,
        registrationIdType: typeof registrationId,
        registrationTypeType: typeof registrationType
      });

      // Validate required parameters
      if (!amount || !registrationId || !registrationType) {
        console.log('Validation failed: Missing required parameters');
        return res.status(400).json({ 
          error: 'Missing required parameters: amount, registrationId, or registrationType' 
        });
      }

      // Validate amount is a positive number
      if (typeof amount !== 'number' || amount <= 0) {
        console.log('Validation failed: Invalid amount', amount);
        return res.status(400).json({ 
          error: 'Amount must be a positive number' 
        });
      }

      // Log Stripe configuration check
      console.log('Stripe configuration check:', {
        hasStripeSecret: !!functions.config().stripe?.secret,
        stripeSecretLength: functions.config().stripe?.secret ? functions.config().stripe.secret.length : 0,
        stripeSecretPrefix: functions.config().stripe?.secret ? functions.config().stripe.secret.substring(0, 8) : 'N/A'
      });

      // Check if Stripe is properly initialized
      if (!stripe) {
        console.error('STRIPE_NOT_INITIALIZED: Stripe is not properly initialized. Please check Firebase functions configuration.');
        return res.status(500).json({ 
          error: 'Payment service configuration error. Please contact support.' 
        });
      }

      console.log('Creating payment intent with amount:', amount, 'cents');

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Ensure amount is in cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          registrationId: registrationId.toString(),
          registrationType: registrationType.toString(),
          source: 'beetennis-app'
        }
      });

      console.log('Payment intent created successfully:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status
      });

      // Return successful response
      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount
      });

    } catch (error) {
      console.error('=== ERROR CREATING PAYMENT INTENT ===');
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode,
        raw: error.raw,
        stack: error.stack
      });
      
      // Log Stripe configuration status
      console.error('Stripe config status:', {
        hasStripeConfig: !!functions.config().stripe,
        hasStripeSecret: !!functions.config().stripe?.secret,
        stripeSecretPrefix: functions.config().stripe?.secret ? functions.config().stripe.secret.substring(0, 8) : 'N/A'
      });

      // Handle Stripe-specific errors
      if (error.type === 'StripeCardError') {
        console.error('Stripe card error:', error);
        return res.status(400).json({ 
          error: error.message,
          code: error.code
        });
      }
      
      // Handle other errors
      console.error('Unexpected error:', error);
      res.status(500).json({ 
        error: 'Failed to create payment intent',
        message: error.message || 'An unexpected error occurred',
        type: error.type,
        code: error.code
      });
    }
  });
});
