import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaEnvelope, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import Footer from '../../Components/Footer';
import StayGame from '../../Components/StayGame';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (location.state) {
      setBookingData(location.state.bookingData);
      setPaymentDetails({
        amount: location.state.amount,
        paymentIntentId: location.state.paymentIntentId
      });
    }
  }, [location.state]);

  const closeModal = () => {
    setShowModal(false);
    navigate('/');
  };

  const viewOrders = () => {
    setShowModal(false);
    navigate('/registrations');
  };

  if (!bookingData) {
    return (
      <>
        <div className='mt-5 pt-5'></div>
        <div className="container my-5">
          <div className="alert alert-warning text-center">
            <h4>No Payment Data Found</h4>
            <p>Please complete a payment first to view the success page.</p>
            <Link to="/programs" className="btn btn-primary">
              Browse Programs
            </Link>
          </div>
        </div>
        <StayGame />
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className='mt-5 pt-5'></div>
      
      {/* Thank You Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div className="w-100 text-center">
                  <FaCheckCircle className="text-success mb-3" size={64} />
                  <h4 className="modal-title fw-bold text-success">Payment Successful!</h4>
                </div>
              </div>
              
              <div className="modal-body text-center">
                <p className="text-muted mb-3">
                  Thank you for your payment! Your registration has been confirmed.
                </p>
                
                <div className="bg-light rounded p-3 mb-3">
                  <h6 className="fw-semibold mb-2">Booking Details:</h6>
                  <p className="mb-1"><strong>{bookingData.programName}</strong></p>
                  {bookingData.location && (
                    <p className="mb-1 small text-muted">Location: {bookingData.location}</p>
                  )}
                  {bookingData.timings && (
                    <p className="mb-1 small text-muted">Schedule: {bookingData.timings}</p>
                  )}
                  
                  <hr className="my-2" />
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Amount Paid:</span>
                    <span className="text-success fw-bold">${paymentDetails?.amount?.toFixed(2)}</span>
                  </div>
                  
                  {paymentDetails?.paymentIntentId && paymentDetails.paymentIntentId !== 'free-payment' && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Transaction ID: {paymentDetails.paymentIntentId.substring(0, 8)}...
                      </small>
                    </div>
                  )}
                </div>

                <p className="small text-muted mb-3">
                  <FaEnvelope className="me-1" />
                  A confirmation email has been sent to your email address.
                </p>
              </div>

              <div className="modal-footer border-0 pt-0">
                <div className="w-100 d-flex flex-column gap-2">
                  <button 
                    className="btn btn-success fw-semibold"
                    onClick={viewOrders}
                  >
                    <FaShoppingBag className="me-2" />
                    View My Orders
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={closeModal}
                  >
                    <FaArrowLeft className="me-2" />
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (visible when modal is closed) */}
      {!showModal && (
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card border-0 shadow">
                <div className="card-body text-center p-5">
                  <FaCheckCircle className="text-success mb-3" size={48} />
                  <h2 className="fw-bold text-success mb-3">Payment Completed Successfully!</h2>
                  
                  <div className="bg-light rounded p-4 mb-4">
                    <h5 className="fw-semibold mb-3">Booking Confirmation</h5>
                    <div className="text-start">
                      <p><strong>Program:</strong> {bookingData.programName}</p>
                      {bookingData.location && (
                        <p><strong>Location:</strong> {bookingData.location}</p>
                      )}
                      {bookingData.timings && (
                        <p><strong>Schedule:</strong> {bookingData.timings}</p>
                      )}
                      <p><strong>Amount:</strong> ${paymentDetails?.amount?.toFixed(2)}</p>
                      {paymentDetails?.paymentIntentId && paymentDetails.paymentIntentId !== 'free-payment' && (
                        <p><strong>Transaction ID:</strong> {paymentDetails.paymentIntentId}</p>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <Link to="/orders" className="btn btn-primary">
                      <FaShoppingBag className="me-2" />
                      View Orders
                    </Link>
                    <Link to="/programs" className="btn btn-outline-secondary">
                      <FaArrowLeft className="me-2" />
                      Browse More Programs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <StayGame />
      <Footer />
    </>
  );
};

export default PaymentSuccess;
