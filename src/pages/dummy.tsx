import React, { useState, useEffect } from 'react'
import { FaRegClock, FaRegEnvelope } from 'react-icons/fa6'
import { IoIosArrowForward } from 'react-icons/io'
import { MdOutlineLocationOn } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../Components/Footer'
import StayGame from '../../Components/StayGame'
import { getCollectionData } from './Firebase/CloudFirestore/GetData'
import { isUserLoggedIn } from '../utils/authState'
import { toast } from 'react-toastify'

function Events() {
    const [selectedCategory, setSelectedCategory] = useState('All Events')
    const [eventsData, setEventsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [visibleEvents, setVisibleEvents] = useState(2)
    const navigate = useNavigate()

    const categories = ['All Events', 'Tournaments', 'Camps', 'Workshops', 'Social', 'Corporate']

    // In Events.js - update the handleRegisterClick function
const handleRegisterClick = (event) => {
  if (isUserLoggedIn()) {
    navigate("/registration", {
      state: {
        eventId: event.id,
        eventName: event.title || event.eventName,
        price: event.price || 0,
        source: "events",
        eventData: event // Pass the full event data if needed
      },
    });
  } else {
    toast.success("Please sign up to register for events.");

    const params = new URLSearchParams({
      redirect: "/registration",
      eventId: event.id,
      eventName: event.title || event.eventName,
      price: event.price || 0,
      source: "events"
    });

    navigate(`/signup?${params.toString()}`);
  }
};



    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const data = await getCollectionData('events')
            setEventsData(data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching events:', err)
            setError('Failed to load events. Please try again later.')
            setLoading(false)
        }
    }

    const filteredEvents = selectedCategory === 'All Events'
        ? eventsData
        : eventsData.filter(event =>
            event.category === selectedCategory ||
            event.tag === selectedCategory
        )

    return (
        <>
            <div className='mt-5 '></div>

            {/* first section */}
            <section>
                <div className='cta-events'>
                    <div className='container text-center text-white'>

                        <div className=' fw-bold display-md-4 fs-1' >Exciting <span className='text-yellow'>Events</span> & Tournaments</div>
                        <div className='fs-md-4 fs-6 fw-semibold text-white'>Join our vibrant community for tournaments, social events, and special activities</div>
                    </div>

                </div>
            </section>

            {/* upcoming events  */}
            <section className='container my-5'>
                <div className='text-center mb-5'>
                    <div className='fs-2 fw-bold mb-4'>Upcoming Events</div>
                    <div className='d-flex justify-content-center gap-3 flex-wrap'>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`btn btn-sm rounded-3 px-4 py-2 fw-bold ${selectedCategory === category
                                    ? 'btn-warning text-dark'
                                    : 'btn-outline-warning text-dark'
                                    }`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* cards */}
            <section className='my-5'>
                <div className='container'>
                    {loading && (
                        <div className='text-center py-5'>
                            <div className='spinner-border text-warning' role='status'>
                                <span className='visually-hidden'>Loading...</span>
                            </div>
                            <p className='mt-3'>Loading events...</p>
                        </div>
                    )}

                    {error && (
                        <div className='text-center py-5'>
                            <div className='alert alert-danger' role='alert'>
                                {error}
                            </div>
                            <button className='btn btn-warning' onClick={fetchEvents}>
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredEvents.length === 0 && (
                        <div className='text-center py-5'>
                            <p className='fs-5 text-muted'>No events found for the selected category.</p>
                        </div>
                    )}

                    {!loading && !error && filteredEvents.length > 0 && (
                        <div className='row justify-content-center align-items-start g-4'>
                            {filteredEvents.slice(0, visibleEvents).map((event) => (
                                <div key={event.id} className='col-12 col-md-6 col-lg-4 col-xl-5'>
                                    <div className='rounded-4 shadow h-100'>
                                        <img
                                            src={event.imageUrl || "/images/kiraOne.png"}
                                            alt={event.title || event.eventName}
                                            className="img-fluid mb-3 p-0 rounded-top"
                                            style={{ maxHeight: '220px', width: '100%', objectFit: 'cover' }}
                                        />
                                        <div className='px-4 pb-4'>
                                            <div className='fs-5 text-start fw-semibold'>{event.title || event.eventName}</div>
                                            <div className='items-start ps-3 pt-2 fs-6 fw-semibold text-gray'>
                                                <MdOutlineLocationOn className='me-2 fs-5 text-dark' /> {event.location || 'Location not specified'}
                                            </div>
                                            <div className='items-start ps-3 fs-6 fw-semibold text-gray'>
                                                <FaRegClock className='text-dark me-2 fs-5' /> {event.schedule || event.timings || 'Timing not specified'}
                                            </div>
                                            <div className='fs-6 fw-semibold mt-3'>{event.shortDescription || ''}</div>
                                            <div className='fs-6 fw-semibold mt-3'>
                                                <div dangerouslySetInnerHTML={{ __html: event.description || '' }} />
                                            </div>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <Link
                                                to={`/event/${event.id}`}
                                                className="btn btn-outline-warning rounded-3 btn-md fs-6 px-3 py-2 text-decoration-none"
                                            >
                                                View Details
                                            </Link>
                                        
                                           <button
  className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
  onClick={() => handleRegisterClick(event)}
>
  Register Now <IoIosArrowForward />
</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                                {filteredEvents.length > visibleEvents && (
                                    <div className='text-center mt-4'>
                                        <button 
                                            onClick={() => setVisibleEvents(prev => Math.min(prev + 3, filteredEvents.length))}
                                            className="btn btn-custom-yellow btn-lg fs-5 px-4 py-2"
                                        >
                                            More Events <IoIosArrowForward />
                                        </button>
                                    </div>
                                )}
                </div>
            </section >

            <StayGame />

            <Footer />


        </>
    )
}

export default Events
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { emailPasswordSignUp } from "./Firebase/FirebaseAuth/UserSignUp";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  // Extract redirect
  const redirect = searchParams.get('redirect');

  // Extract all parameters
  const programId = searchParams.get('programId');
  const programName = searchParams.get('programName');
  const eventId = searchParams.get('eventId');
  const eventName = searchParams.get('eventName');
  const price = searchParams.get('price');
  const source = searchParams.get('source');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await emailPasswordSignUp(fullName, email, password);

      if (result.success) {
        setSuccessMessage(result.message);
        
        setTimeout(() => {
          if (redirect) {
            // Prepare registration data to pass
            const registrationData = {};
            
            // Add program data if available
            if (programId) {
              registrationData.programId = programId;
              registrationData.programName = programName;
            }
            
            // Add event data if available
            if (eventId) {
              registrationData.eventId = eventId;
              registrationData.eventName = eventName;
            }
            
            // Add common data
            if (price) registrationData.price = price;
            if (source) registrationData.source = source;
            
            navigate(redirect, { state: registrationData });
          } else {
            navigate("/login");
          }
        }, 3000);
      } else {
        setError(result.error || "Sign up failed");
      }
    } catch (error) {
      setError(error.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join BeeTennis today</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="bg-white border text-dark border-gray-300 rounded-3 px-2 py-1 w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="bg-white border text-dark border-gray-300 rounded-3 px-2 py-1 w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className="bg-white border text-dark border-gray-300 rounded-3 px-2 py-1 w-full"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.45 18.45 0 0 1-5.06 5.94M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className="bg-white border text-dark border-gray-300 rounded-3 px-2 py-1 w-full"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.45 18.45 0 0 1-5.06 5.94M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path d="M1 1l22 22" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;


import React, { useState, useEffect } from 'react';
import { FaRegEnvelope } from 'react-icons/fa6';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements, CardElement,useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, updateRegistrationPaymentStatus } from '../services/stripeService';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
          // For class registrations, fetch the class registration data directly
          const classRegistrationData = await getDocumentData('classRegistrations', registrationId);
          
          if (!classRegistrationData) {
            throw new Error('Could not fetch class registration details');
          }

          // Create booking data from class registration
          const data = {
            registrationId,
            registrationType,
            programName: classRegistrationData.facilityName || 'Tennis Class',
            price: classRegistrationData.finalPrice || classRegistrationData.totalPrice || 0,
            description: 'Professional tennis coaching session',
            shortDescription: `Class at ${classRegistrationData.facilityName || 'Bowditch Middle School Outside Tennis Courts'}`,
            location: classRegistrationData.facilityName || 'Bowditch Middle School Outside Tennis Courts',
            timings: classRegistrationData.timeSlot || '',
            programType: 'Tennis Class',
            category: 'Class',
            adminFee: classRegistrationData.adminFee || 0,
            duration: classRegistrationData.duration || '',
            // Class-specific fields
            className: classRegistrationData.name || '',
            classDate: classRegistrationData.date || '',
            guests: classRegistrationData.guests || 1,
            phone: classRegistrationData.phone || '',
            // Participant info
            name: classRegistrationData.name || '',
            email: classRegistrationData.email || '',
            userId: classRegistrationData.userId || ''
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
            isFree: programData.isFree || false
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
          description: 'Professional tennis coaching'
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