import React, { useState, useEffect } from 'react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { FaRegEnvelope } from 'react-icons/fa6'
import Footer from '../../Components/Footer'
import { toast } from 'react-toastify';
import { FaArrowRight } from "react-icons/fa6";
import { CiCalendarDate } from "react-icons/ci";
import { GoPerson } from "react-icons/go";
import { IoTimeOutline } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
import { IoLockOpenOutline } from "react-icons/io5";
import StayGame from '../../Components/StayGame';
import { addDocument } from './Firebase/CloudFirestore/SetData';
import { auth } from './Firebase/firebase';

function BookClass() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    phone: '',
    guests: '',
    timeSlot: '',
    duration: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('booking');

  // ✅ Prefill form with Firebase user data
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
        
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please sign in to book a class.');
        window.location.href = '/login?redirect=/book-class';
        return;
      }

      const classRegistrationData = {
        name: formData.name,
        date: formData.date,
        phone: formData.phone,
        guests: parseInt(formData.guests),
        timeSlot: formData.timeSlot,
        duration: formData.duration,
        status: 'pending',
        facilityName: 'Bowditch Middle School Outside Tennis Courts',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalPrice: 406,
        adminFee: 2.50,
        finalPrice: 408.25,
        userId: user.uid,
        email: formData.email,
      };

      const docRef = await addDocument("classRegistrations", classRegistrationData);

      localStorage.setItem('classBookingData', JSON.stringify({
        ...classRegistrationData,
        registrationId: docRef.id
      }));

      setActiveSection('checkout');
    } catch (error) {
      console.error('Error saving class registration:', error);
      setError('Failed to save booking. Please try again.');
      alert(`Error: ${error.message || 'Failed to save booking. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const bookingData = JSON.parse(localStorage.getItem('classBookingData') || '{}');
            
            if (!bookingData || !bookingData.userId) {
                throw new Error('No booking data found. Please book a class first.');
            }
            
            const updatedData = {
                ...bookingData,
                status: 'confirmed',
                updatedAt: new Date()
            };
            
            // Redirect to payment page with registrationId and type=class
            const params = new URLSearchParams();
            params.append('registrationId', bookingData.registrationId);
            params.append('type', 'class');
            window.location.href = `/payment?${params.toString()}`;
            
        } catch (error) {
            console.error('Error during checkout:', error);
            setError('Checkout failed. Please try again.');
            alert(`Error: ${error.message || 'Checkout failed. Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className='mt-5 '></div>

            {/* first section */}
            <section>
                <div className='bookclass-hero'>
                    <div className='container text-center text-white'>

                        <div className=' fw-bold display-4  text-yellow' >Book a Class or Facility</div>
                        <div className='fs-4 fw-semibold text-white'>Experience professional tennis coaching tailored to your skill level</div>
                    </div>

                </div>
            </section>





            {/* booking form section */}
         <section>
        <div className="my-5">
          <div className="row justify-content-center align-items-start px-4 g-4">
            <div className="col-12 col-md-10 col-lg-10 col-xl-9">
              <div className="rounded-4 border">
                <div className="p-4">
                  {activeSection === "booking" ? (
                    <>
                      <div className="">
                        <h2 className="fw-bold mb-4">Book a Class</h2>
                      </div>
                      <div className="">
                        <img
                          src="/images/BookClass-second.png"
                          alt="Book Class"
                          className="w-100 rounded-4"
                          style={{ height: "250px", objectFit: "cover" }}
                        />
                        <div className="py-4">
                          <form onSubmit={handleConfirm}>
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  className="form-control"
                                  placeholder="Enter your name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  className="form-control"
                                  placeholder="Enter your email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                             
                            </div>

                            <div className="row">
                                 <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  name="phone"
                                  className="form-control"
                                  placeholder="Enter your phone number"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                  Date
                                </label>
                                <Flatpickr
                                  name="date"
                                  className="form-control"
                                  value={formData.date}
                                  placeholder='MM/DD/YYYY'
                                  onChange={(selectedDates, dateStr) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      date: dateStr,
                                    }));
                                  }}
                                  options={{
                                    dateFormat: "Y-m-d",
                                    minDate: "today",
                                    placeholder: "Select date",
                                    allowInput: true,
                                  }}
                                  required
                                />
                              </div>

                            
                            </div>

                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                  Time Slot
                                </label>
                                <select
                                  name="timeSlot"
                                  className="form-select"
                                  value={formData.timeSlot}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Select time slot</option>
                                  <option value="9:00 AM">9:00 AM</option>
                                  <option value="10:00 AM">10:00 AM</option>
                                  <option value="11:00 AM">11:00 AM</option>
                                  <option value="12:00 PM">12:00 PM</option>
                                  <option value="1:00 PM">1:00 PM</option>
                                  <option value="2:00 PM">2:00 PM</option>
                                  <option value="3:00 PM">3:00 PM</option>
                                  <option value="4:00 PM">4:00 PM</option>
                                  <option value="5:00 PM">5:00 PM</option>
                                </select>
                              </div>

                              <div className="col-md-6 mb-4">
                                <label className="form-label fw-semibold">
                                  Duration
                                </label>
                                <select
                                  name="duration"
                                  className="form-select"
                                  value={formData.duration}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Select duration</option>
                                  <option value="30 min">30 minutes</option>
                                  <option value="1 hour">1 hour</option>
                                  <option value="1.5 hours">1.5 hours</option>
                                  <option value="2 hours">2 hours</option>
                                </select>
                              </div>
                            </div>
                              <div className="mb-5">
                                <label className="form-label fw-semibold">
                                  Number of Guests
                                </label>
                                <select
                                  name="guests"
                                  className="form-select"
                                  value={formData.guests}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">
                                    Select number of guests
                                  </option>
                                  <option value="1">1 Guest</option>
                                  <option value="2">2 Guests</option>
                                  <option value="3">3 Guests</option>
                                  <option value="4">4 Guests</option>
                                  <option value="5">5+ Guests</option>
                                </select>
                              </div>

                            <button
                              type="submit"
                              className="btn btn-custom-yellow  py-2 fw-bold fs-6"
                            >
                              Confirm <FaArrowRight />
                            </button>
                          </form>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* second section */}
                      <div className="checkout-section">
                        <div className="row align-items-center g-3 mb-5">
                          <div className="col-4 col-md-3 col-lg-2">
                            <img
                              src="/images/bookclass-Chekcout.png"
                              alt="Tennis Court"
                              className="img-fluid rounded-3"
                              style={{
                                maxHeight: "150px",
                                objectFit: "cover",
                                width: "100%",
                              }}
                            />
                          </div>
                          <div className="col-8 col-md-6 col-lg-7">
                            <h5 className="fs-3 fw-semibold w-75 mb-2">
                              Bowditch Middle School Outside Tennis Courts
                            </h5>
                          </div>
                          <div className="col-12 col-md-3 col-lg-3 text-md-end">
                            <div className="h3 mb-1">$406 USD</div>
                          </div>
                        </div>

                        <div className="border border-3 rounded-4 p-md-4 p-2 mb-4">
                          {/* ✅ Responsive layout fix here */}
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch mb-3">
                            <div className="col-12 col-md-6 col-lg-4 col-xl-6 px-md-4 p-2 border-end border-3">
                              <div className="fw-semibold fs-4">
                                Your Booking
                              </div>
                              <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <CiCalendarDate />
                                    <span>Dates</span>
                                  </div>
                                  <div className="fw-semibold">
                                    {formData.date || "Select date"}
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between mt-4 align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <GoPerson />
                                    <span>Guest</span>
                                  </div>
                                  <div className="fw-semibold">
                                    {formData.guests || "0"} Guest
                                    {formData.guests > 1 ? "s" : ""}
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between mt-4 align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <IoTimeOutline />
                                    <span>Time</span>
                                  </div>
                                  <div className="fw-semibold">
                                    {formData.timeSlot || "Select time"}
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between mt-4 align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <FiPhone />
                                    <span>Phone</span>
                                  </div>
                                  <div className="fw-semibold">
                                    {formData.phone || "Enter phone"}
                                  </div>
                                </div>
                                 <div className="d-flex justify-content-between mt-4 align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <FiPhone />
                                    <span>Email</span>
                                  </div>
                                  <div className="fw-semibold">
                                    {formData.email || "Enter phone"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-12 col-md-6 col-lg-4 col-xl-6 px-md-4 p-2">
                              <div className="fw-semibold fs-4">
                                Price Details
                              </div>
                              <div className="d-flex justify-content-between mt-4 align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                  <span>Price</span>
                                </div>
                                <div className="fw-semibold">$406 USD</div>
                              </div>
                              <div className="d-flex justify-content-between mt-4 align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                  <span>Admin fee</span>
                                </div>
                                <div className="fw-semibold">$2.50 USD</div>
                              </div>
                              <div className="d-flex justify-content-between mt-5 align-items-center">
                                <div className="fs-5 fw-semibold">
                                  Total Price
                                </div>
                                <div className="fw-semibold">$408.25 USD</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="btn btn-custom-yellow px-4 py-2 w-100 fw-semibold"
                          >
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              {loading ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <span>Secure Checkout</span>
                                  <IoLockOpenOutline />
                                </>
                              )}
                            </div>
                          </button>
                          {error && (
                            <div className="alert alert-danger mt-3">
                              {error}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            <StayGame />

            <Footer />
        </>

    )
}

export default BookClass
