const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function handlers
const createPaymentIntent = require('./createPaymentIntent');

// Export functions
exports.createPaymentIntent = createPaymentIntent.createPaymentIntent;

// Health check endpoint for testing
exports.healthCheck = functions.https.onRequest((req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Firebase functions are running correctly'
  });
});
