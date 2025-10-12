# Payment Initialization Error Fix Guide

## Problem
Payment initialization error: 500 Internal Server Error when calling `/api/createPaymentIntent`

## Root Cause
The Stripe secret key is likely not configured in Firebase functions configuration, causing the function to fail when trying to initialize Stripe.

## Solution Steps

### 1. Set Stripe Secret Key in Firebase Functions Config

Run these commands in your terminal:

```bash
# Check current Firebase functions config
firebase functions:config:get

# Set Stripe secret key (use your actual secret key without 'Bearer ' prefix)
firebase functions:config:set stripe.secret="sk_test_51Q638VL06v98rXHkUSxEJiRGAISmJ7uJWU5eVABBAKpN2ZlFFt3hL6NMCaztqWnsh1LA3s4fS5Zhj0CIXH447TQC00XNpkeD0i"

# Deploy Firebase functions after setting config
firebase deploy --only functions
```

### 2. Verify Firebase Functions Are Running

**Option A: Use Firebase Emulator (Development)**
```bash
# Start Firebase emulator
firebase emulators:start --only functions
```

**Option B: Deploy to Production**
```bash
# Deploy functions to Firebase
firebase deploy --only functions
```

### 3. Test the Health Check Endpoint

After deploying/running functions, test if they're accessible:

```bash
# For emulator (development)
curl http://localhost:5001/kaaf-web/us-central1/healthCheck

# For production
curl https://us-central1-kaaf-web.cloudfunctions.net/healthCheck
```

### 4. Test Payment Intent Creation

You can test the payment intent creation directly:

```bash
# Test with sample data
curl -X POST http://localhost:5001/kaaf-web/us-central1/createPaymentIntent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "registrationId": "test-reg-123",
    "registrationType": "program"
  }'
```

### 5. Check Firebase Function Logs

If you still encounter issues, check the logs:

```bash
firebase functions:log --only createPaymentIntent
```

## Enhanced Error Handling

The Firebase function has been updated with better error handling:
- Checks if Stripe secret key is configured
- Provides detailed error logging
- Returns user-friendly error messages
- Logs Stripe configuration status for debugging

## Files Modified

- `firebase-functions/createPaymentIntent.js` - Enhanced error handling and logging
- Created `firebase-setup-commands.txt` - Commands for setting up Firebase config
- Created this guide document

## Next Steps

1. Run the Firebase config setup commands
2. Deploy/redeploy Firebase functions
3. Test the payment flow in your application
4. Check logs if any issues persist

## Common Issues

1. **Stripe secret key not set**: Use `firebase functions:config:set` to configure it
2. **Firebase emulator not running**: Start with `firebase emulators:start`
3. **Functions not deployed**: Deploy with `firebase deploy --only functions`
4. **CORS issues**: The function includes proper CORS headers
