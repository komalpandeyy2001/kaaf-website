import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Q638VL06v98rXHkhl5qtB6ItFHwGhu0ryjlRknqn1DvjgdvJeGbpejc6SiEcWPxaRHpmjECKYjKwcBrTuDE2HDg001UcC2ufb'; // Test publishable key

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const createPaymentIntent = async (amount, registrationId, registrationType = 'program') => {
  try {
    // Determine the correct endpoint based on environment
    const isDevelopment = import.meta.env.MODE === 'development';
    const endpoint =
      'https://us-central1-kaaf-web.cloudfunctions.net/createPaymentIntent'; // Production

    console.log('Creating payment intent with endpoint:', endpoint);

    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        registrationId,
        registrationType
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { error: `Server error极: ${response.status} ${response.statusText}` };
      }
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();

    if (!data.clientSecret) {
      throw new Error('Invalid response: missing client secret');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Provide user-friendly error messages
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: Payment server is not responding. Please try again later.');
    }

    if (error.message.includes('CORS') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to connect to payment server. Please check your internet connection and try again.');
    }

    if (error.message.includes('Firebase')) {
      throw new Error('Backend service error: Payment system is temporarily unavailable. Please try again later.');
    }

    throw new Error(`Payment setup failed: ${error.message}`);
  }
};

export const updateRegistrationPaymentStatus = async (registrationId, registrationType, paymentIntentId) => {
  try {
    const collectionName = registrationType === 'event' ? 'eventRegistrations' :
      registrationType === 'class' ? 'classRegistrations' : 'programRegistrations';

    const { updateDocument } = await import('../pages/Firebase/CloudFirestore/UpdateData');

    await updateDocument(collectionName, registrationId, {
      paymentStatus: 'completed',
      paymentIntentId,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};
