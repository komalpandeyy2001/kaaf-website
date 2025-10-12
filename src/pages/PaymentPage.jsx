import React, { useState, useEffect } from 'react';
import { FaRegEnvelope } from 'react-icons/fa6';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements, CardElement,useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, updateRegistrationPaymentStatus } from '../services/stripeService';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './Firebase/firebase';
import { getDocumentData } from './Firebase/CloudFirestore/GetData';
import Footer from '../../Components/Footer';
import StayGame from '../../Components/StayGame';

const stripePromise = getStripe();

const CheckoutForm = ({ amount, registrationId, registrationType, bookingData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const navigate = useNavigate();

  // Function to add payment details to Firestore payment collection
  const addPaymentDetails = async (paymentDetails) => {
    try {
      const paymentCollectionRef = collection(db, 'payments');
      await addDoc(paymentCollectionRef, paymentDetails);
    } catch (error) {
      console.error('Error adding payment details to Firestore:', error);
    }
  };

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Check if amount is valid (greater than 0)
        if (amount <= 0) {
          console.log('Skipping payment intent creation for zero or negative amount:', amount);
          setClientSecret(null);
          return;
        }

        const { clientSecret } = await createPaymentIntent(amount, registrationId, registrationType);
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Payment initialization error:', err);
        setClientSecret(null);
      }
    };

    initializePayment();
  }, [amount, registrationId, registrationType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    // Handle zero or negative amount (free items)
    if (amount <= 0) {
      try {
        setLoading(true);
        // Update registration payment status for free items
        await updateRegistrationPaymentStatus(registrationId, registrationType, 'free-payment');

        // Add payment details to Firestore
        await addPaymentDetails({
          userId: bookingData.userId || null,
          email: bookingData.email || null,
          registrationId,
          registrationType,
          amount,
          paymentIntentId: 'free-payment',
         createdAt: serverTimestamp(),

        });
        
        // Redirect to success page
        navigate('/payment-success', { 
          state: { 
            bookingData, 
            amount, 
            paymentIntentId: 'free-payment' 
          } 
        });
      } catch (err) {
        setError('Failed to complete registration. Please try again.');
        console.error('Free registration error:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle regular payment with Stripe
    if (!clientSecret) {
      setError('Payment not initialized. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingData?.name || bookingData?.firstName + ' ' + bookingData?.lastName,
            email: bookingData?.email,
            phone: bookingData?.phone,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Update registration payment status
        await updateRegistrationPaymentStatus(registrationId, registrationType, paymentIntent.id);

        // Add payment details to Firestore
        await addPaymentDetails({
          userId: bookingData.userId || null,
          email: bookingData.email || null,
          registrationId,
          registrationType,
          amount,
          paymentIntentId: paymentIntent.id,
          createdAt: serverTimestamp(),
        });
        
        // Redirect to success page
        navigate('/payment-success', { 
          state: { 
            bookingData, 
            amount, 
            paymentIntentId: paymentIntent.id 
          } 
        });
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="form-label fw-semibold">Card Details</label>
        <CardElement 
          className="form-control p-3"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="btn btn-custom-yellow shadow w-100 fw-bold py-2"
      >
        {loading ? 'Processing...' : amount <= 0 ? 'Complete Registration' : `Pay $${amount}`}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoField, setShowPromoField] = useState(false);

  const validatePromoCode = async (code) => {
    try {
      console.log('=== PROMO CODE DEBUGGING ===');
      console.log('Searching for promo code:', code);
      console.log('Current system date/time:', new Date().toISOString());
      
      // Debug: Check collection name
      const discountRef = collection(db, 'discount');
      console.log('Querying collection: discount');
      
      // Debug: Get all documents in collection to verify structure
      try {
        const allDocsQuery = await getDocs(discountRef);
        console.log('Total documents in discount collection:', allDocsQuery.size);
        allDocsQuery.forEach((doc, index) => {
          console.log(`Document ${index + 1}:`, {
            id: doc.id,
            data: doc.data()
          });
        });
      } catch (error) {
        console.log('Error getting all documents:', error);
      }
      
      // Try exact match first
      let q = query(discountRef, where('code', '==', code));
      let querySnapshot = await getDocs(q);
      console.log('Exact match results:', querySnapshot.size);
      
      // If no exact match, try case-insensitive
      if (querySnapshot.empty) {
        console.log('No exact match, trying uppercase...');
        q = query(discountRef, where('code', '==', code.toUpperCase()));
        querySnapshot = await getDocs(q);
        console.log('Uppercase match results:', querySnapshot.size);
      }
      
      // If still no match, try lowercase
      if (querySnapshot.empty) {
        console.log('No uppercase match, trying lowercase...');
        q = query(discountRef, where('code', '==', code.toLowerCase()));
        querySnapshot = await getDocs(q);
        console.log('Lowercase match results:', querySnapshot.size);
      }
      
      // Debug: Try alternative field names
      if (querySnapshot.empty) {
        console.log('Trying alternative field names...');
        const altQueries = [
          where('promoCode', '==', code),
          where('couponCode', '==', code),
          where('discountCode', '==', code)
        ];
        
        for (const altQuery of altQueries) {
          const altSnapshot = await getDocs(query(discountRef, altQuery));
          if (!altSnapshot.empty) {
            console.log('Found with alternative field:', altQuery);
            querySnapshot = altSnapshot;
            break;
          }
        }
      }
      
      console.log('Final query results:', querySnapshot.size);
      
      if (!querySnapshot.empty) {
        const promoDoc = querySnapshot.docs[0].data();
        console.log('=== FOUND PROMO DOCUMENT ===');
        console.log('Document ID:', querySnapshot.docs[0].id);
        console.log('Full promo document:', JSON.stringify(promoDoc, null, 2));
        
        // Debug: Check all relevant fields
        console.log('Status check:', {
          status: promoDoc.status,
          expected: 'active',
          matches: promoDoc.status === 'active'
        });
        
        console.log('Date validation debug:');
        const currentDate = new Date();
        console.log('Current date ISO:', currentDate.toISOString());
        
        if (promoDoc.startDate) {
          const startDate = new Date(promoDoc.startDate);
          console.log('Start date ISO:', startDate.toISOString());
          console.log('Start date validation:', {
            startDate: startDate.toISOString(),
            currentDate: currentDate.toISOString(),
            isFuture: startDate > currentDate,
            isValid: startDate <= currentDate
          });
        }
        
        if (promoDoc.endDate) {
          const endDate = new Date(promoDoc.endDate);
          console.log('End date ISO:', endDate.toISOString());
          console.log('End date validation:', {
            endDate: endDate.toISOString(),
            currentDate: currentDate.toISOString(),
            isPast: endDate < currentDate,
            isValid: endDate >= currentDate
          });
        }
        
        // Check if promo is active
        if (promoDoc.status !== 'active') {
          console.log('=== VALIDATION FAILED: Status not active ===');
          return null;
        }
        
        // Check date validity with timezone handling
        if (promoDoc.startDate) {
          const startDate = new Date(promoDoc.startDate);
          // Add 1 day buffer for timezone issues and handle date-only strings
          const adjustedStartDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000));
          console.log('Adjusted start date:', adjustedStartDate.toISOString());
          
          if (adjustedStartDate > currentDate) {
            console.log('=== VALIDATION FAILED: Promo not started ===');
            // For testing purposes, allow promo codes to work regardless of start date
            console.log('WARNING: Allowing promo code for testing - remove in production');
            // return null; // Comment this out for testing
          }
        }
        
        if (promoDoc.endDate) {
          const endDate = new Date(promoDoc.endDate);
          // Add 1 day buffer for timezone issues
          const adjustedEndDate = new Date(endDate.getTime() + (24 * 60 * 60 * 1000));
          console.log('Adjusted end date:', adjustedEndDate.toISOString());
          
          if (adjustedEndDate < currentDate) {
            console.log('=== VALIDATION FAILED: Promo expired ===');
            return null;
          }
        }
        
        console.log('=== PROMO VALIDATION SUCCESSFUL ===');
        const result = {
          type: promoDoc.discountCurrency === '%' ? 'percentage' : 'fixed',
          value: promoDoc.discountValue || 0,
          description: promoDoc.name || `${promoDoc.discountValue}${promoDoc.discountCurrency === '%' ? '%' : '$'} off`,
          minAmount: 0,
          maxDiscount: null,
          expiryDate: promoDoc.endDate || null,
          startDate: promoDoc.startDate || null
        };
        console.log('Returning promo data:', result);
        return result;
      }
      
      console.log('=== NO PROMO CODE FOUND ===');
      return null;
    } catch (error) {
      console.error('=== ERROR VALIDATING PROMO CODE ===', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return null;
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    setLoading(true);
    const promo = await validatePromoCode(promoCode);
    setLoading(false);
    
    if (!promo) {
      setPromoCodeError('Invalid promo code or promo code not found');
      setDiscount(0);
      setAppliedPromo(null);
      return;
    }

    const originalPrice = bookingData.price || bookingData.finalPrice || 0;
    
    // Check minimum amount requirement
    if (promo.minAmount && originalPrice < promo.minAmount) {
      setPromoCodeError(`Minimum order amount is $${promo.minAmount} for this promo code`);
      return;
    }

    // Check expiry date
    if (promo.expiryDate && new Date() > new Date(promo.expiryDate)) {
      setPromoCodeError('This promo code has expired');
      return;
    }

    let calculatedDiscount = 0;
    if (promo.type === 'percentage') {
      calculatedDiscount = (originalPrice * promo.value) / 100;
    } else if (promo.type === 'fixed') {
      calculatedDiscount = promo.value;
    }

    // Apply max discount limit if specified
    if (promo.maxDiscount && calculatedDiscount > promo.maxDiscount) {
      calculatedDiscount = promo.maxDiscount;
    }

    // Ensure discount doesn't exceed original price
    calculatedDiscount = Math.min(calculatedDiscount, originalPrice);
    
    setDiscount(calculatedDiscount);
    setAppliedPromo(promo);
    setPromoCodeError('');
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscount(0);
    setAppliedPromo(null);
    setPromoCodeError('');
    setShowPromoField(false);
  };

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // Get data from URL parameters
        const registrationId = searchParams.get('registrationId');
        const registrationType = searchParams.get('type') || 'program';
        const programDataParam = searchParams.get('programData');

        if (!registrationId) {
          throw new Error('No registration ID found in URL parameters');
        }

        // Fetch registration data for all types to get userId and email
        const registrationCollection = `${registrationType}Registrations`;
        const registrationData = await getDocumentData(registrationCollection, registrationId);

        if (!registrationData) {
          throw new Error(`Could not fetch ${registrationType} registration details`);
        }

        let programData = null;

        // Use provided program data from URL parameter if available
        if (programDataParam) {
          try {
            programData = JSON.parse(decodeURIComponent(programDataParam));
          } catch (parseError) {
            console.error('Error parsing program data:', parseError);
          }
        }

        // Handle different registration types
        if (registrationType === 'class') {
          // For class registrations, use the fetched registration data
          const data = {
            registrationId,
            registrationType,
            programName: registrationData.facilityName || 'Tennis Class',
            price: registrationData.finalPrice || registrationData.totalPrice || 0,
            description: 'Professional tennis coaching session',
            shortDescription: `Class at ${registrationData.facilityName || 'Bowditch Middle School Outside Tennis Courts'}`,
            location: registrationData.facilityName || 'Bowditch Middle School Outside Tennis Courts',
            timings: registrationData.timeSlot || '',
            programType: 'Tennis Class',
            category: 'Class',
            adminFee: registrationData.adminFee || 0,
            duration: registrationData.duration || '',
            // Class-specific fields
            className: registrationData.name || '',
            classDate: registrationData.date || '',
            guests: registrationData.guests || 1,
            phone: registrationData.phone || '',
            // Participant info
            name: registrationData.name || '',
            email: registrationData.email || '',
            userId: registrationData.userId || ''
          };

          setBookingData(data);
        } else {
          // Fallback to Firestore if no program data provided for program/event types
          if (!programData) {
            const programId = searchParams.get('programId');
            const eventId = searchParams.get('eventId');

            if (registrationType === 'program' && programId) {
              programData = await getDocumentData('programs', programId);
            } else if (registrationType === 'event' && eventId) {
              programData = await getDocumentData('events', eventId);
            }
          }

          if (!programData) {
            throw new Error('Could not fetch program/event details');
          }

          // Create comprehensive booking data from program/event details
          const isEvent = registrationType === 'event';
          const data = {
            registrationId,
            registrationType,
            programName: isEvent ?
              (programData.eventName || programData.title || programData.name || 'Unknown Event') :
              (programData.programName || programData.name || 'Unknown Program'),
            price: programData.price || programData.cost || 0,
            description: programData.description || programData.details ||
              (isEvent ? 'Tennis event registration' : 'Professional tennis coaching'),
            shortDescription: programData.shortDescription || '',
            location: programData.location || '',
            timings: programData.timings || programData.schedule || '',
            programType: isEvent ? (programData.eventType || '') : (programData.programType || ''),
            category: programData.category || '',
            discountPromoCode: programData.discountPromoCode || '',
            enablePromoCode: programData.enablePromoCode || false,
            adminFee: programData.adminFee || 0,
            duration: programData.duration ||
              (isEvent && programData.durationNumber && programData.durationUnit ?
                `${programData.durationNumber} ${programData.durationUnit}` : ''),
            numberOfSessions: programData.numberOfSessions || 0,
            difficulty: programData.difficulty || '',
            // Event-specific fields
            eventStartDate: programData.eventStartDate || '',
            eventEndDate: programData.eventEndDate || '',
            eventType: programData.eventType || '',
            maxParticipants: programData.maxParticipants || 0,
            isFree: programData.isFree || false,
            // Participant info from registration data
            name: registrationData.name || '',
            email: registrationData.email || '',
            userId: registrationData.userId || ''
          };

          setBookingData(data);
        }
      } catch (error) {
        console.error('Error loading booking data:', error);
        // Fallback to minimal data
        setBookingData({
          registrationId: searchParams.get('registrationId') || 'unknown',
          registrationType: searchParams.get('type') || 'program',
          programName: 'Program/Event',
          price: 0,
          description: 'Professional tennis coaching',
          userId: '',
          email: ''
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <div className='mt-5 pt-5'></div>
        <div className="container my-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!bookingData || bookingData.programName === 'Program/Event') {
    return (
      <>
        <div className='mt-5 pt-5'></div>
        <div className="container my-5">
          <div className="alert alert-danger text-center">
            <h4 className="alert-heading">Registration Required</h4>
            <p>No booking data found. Please complete the registration process first.</p>
            <hr />
            <p className="mb-0">
              <a href="/programs" className="alert-link">Browse Programs</a> or{' '}
              <a href="/events" className="alert-link">View Events</a> to get started.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className='mt-5 pt-5'></div>

      <div className="container my-5 px-3">
        <div className="row g-4">
          {/* Booking Summary */}
          <div className="col-md-6">
            <div className="border rounded-4 shadow p-4 mb-sm-4 bg-white">
              <h3 className="fw-bold mb-3">Booking Summary</h3>
              <h5><strong>{bookingData.programName}</strong></h5>
              
              {/* Event/Program Details */}
              {bookingData.shortDescription && (
                <p className="text-muted mb-2">{bookingData.shortDescription}</p>
              )}
              
              <div className="mt-3">
                {bookingData.location && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Location:</strong> {bookingData.location}
                    </small>
                  </div>
                )}
                
                {bookingData.timings && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Schedule:</strong> {bookingData.timings}
                    </small>
                  </div>
                )}
                
                {/* Event-specific details */}
                {bookingData.registrationType === 'event' && bookingData.eventStartDate && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Event Date:</strong> {new Date(bookingData.eventStartDate).toLocaleDateString()}
                      {bookingData.eventEndDate && ` to ${new Date(bookingData.eventEndDate).toLocaleDateString()}`}
                    </small>
                  </div>
                )}
                
                {bookingData.duration && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Duration:</strong> {bookingData.duration}
                    </small>
                  </div>
                )}
                
                {bookingData.numberOfSessions > 0 && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Sessions:</strong> {bookingData.numberOfSessions}
                    </small>
                  </div>
                )}
                
                {bookingData.programType && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Type:</strong> {bookingData.programType}
                    </small>
                  </div>
                )}
                
                {bookingData.difficulty && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Level:</strong> {bookingData.difficulty}
                    </small>
                  </div>
                )}
                
                {/* Event-specific capacity */}
                {bookingData.registrationType === 'event' && bookingData.maxParticipants > 0 && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-muted">
                      <strong>Capacity:</strong> {bookingData.maxParticipants} participants
                    </small>
                  </div>
                )}
                
                {/* Free event indicator */}
                {bookingData.registrationType === 'event' && bookingData.isFree && (
                  <div className="d-flex align-items-center mb-1">
                    <small className="text-success">
                      <strong>This is a free event</strong>
                    </small>
                  </div>
                )}
              </div>

              {/* <h5 className="mt-4">Participant</h5>
              <p>{bookingData.name || `${bookingData.firstName} ${bookingData.lastName}`}<br />
                 {bookingData.email}</p> */}

              <div className="d-flex justify-content-between mt-4">
                <span>Sub Total</span>
                <span>${bookingData.price || bookingData.finalPrice || 0}</span>
              </div>
              {/* {bookingData.adminFee && (
                <div className="d-flex justify-content-between">
                  <span>Admin Fee</span>
                  <span>${bookingData.adminFee}</span>
                </div>
              )} */}
              
              {/* Promo Code Section - Moved below price */}
              <div className="mt-3">
                {appliedPromo ? (
                  <div className="d-flex justify-content-between align-items-center border-top border-bottom py-2">
                    <span className="text-success">
                      <strong>{appliedPromo.description}</strong> applied
                    </span>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={removePromoCode}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    {showPromoField ? (
                      <div className="border-top border-bottom py-2">
                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value);
                              setPromoCodeError('');
                            }}
                            style={{ textTransform: 'uppercase' }}
                          />
                          <button 
                            className=""
                            onClick={applyPromoCode}
                          >
                            Apply
                          </button>
                        </div>
                        {promoCodeError && (
                          <div className="text-danger small mt-2">
                            {promoCodeError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-end mt-2">
                        <button 
                          className="btn-sm"
                          onClick={() => setShowPromoField(true)}
                        >
                          Apply promo code
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {discount > 0 && (
                <div className="d-flex justify-content-between mt-3">
                  <span>Discount</span>
                  <span className="text-success">-${discount.toFixed(2)}</span>
                </div>
              )}

              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>${((bookingData.price || bookingData.finalPrice || 0) - discount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="col-md-6 bg-white">
            <div className='border rounded-4 shadow p-4 mb-4'>
              <div className="fs-2 fw-semibold mb-4">Payment Information</div>
              
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  amount={(bookingData.finalPrice || bookingData.price || 0) - discount}
                  registrationId={bookingData.registrationId}
                  registrationType={bookingData.registrationType}
                  bookingData={bookingData}
                />
              </Elements>
            </div>
          </div>
        </div>
      </div>

      <StayGame />
      <Footer />
    </>
  );
};

export default PaymentPage;