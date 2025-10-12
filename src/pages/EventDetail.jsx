  import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './Firebase/firebase'
import { getCollectionData } from './Firebase/CloudFirestore/GetData'
import Footer from '../../Components/Footer'
import StayGame from '../../Components/StayGame'
import { FaRegClock, FaPlus, FaMinus } from 'react-icons/fa6'
import { MdOutlineLocationOn } from 'react-icons/md'
import { IoIosArrowBack } from 'react-icons/io'
import { isUserLoggedIn } from '../utils/authState'
import { toast } from 'react-toastify'

function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Track toggled sections
  const [openSections, setOpenSections] = useState({
    overview: true,
    details: true,
    pricing: false,
    location: false,
    additional: false,
    coaches: true
  })

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

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
      toast.success("Please sign in to register for events.");
  
      const params = new URLSearchParams({
        redirect: "/registration",
        eventId: event.id,
        eventName: event.title || event.eventName,
        price: event.price || 0,
        source: "events"
      });
  
      navigate(`/login?${params.toString()}`);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = doc(db, 'events', id)
        const eventSnapshot = await getDoc(eventDoc)

        if (eventSnapshot.exists()) {
          setEvent({
            id: eventSnapshot.id,
            ...eventSnapshot.data()
          })
        } else {
          setError('Event not found')
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Failed to load event details. Please try again later.')
        setLoading(false)
      }
    }

    const fetchCoaches = async () => {
      try {
        const coachesData = await getCollectionData('coaches')
        setCoaches(coachesData)
      } catch (err) {
        console.error('Error fetching coaches:', err)
      }
    }

    fetchEvent()
    fetchCoaches()
  }, [id])

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>{error}</h4>
          <Link to="/events" className="btn btn-warning">
            <IoIosArrowBack className="me-2" />
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>Event not found</h4>
          <Link to="/events" className="btn btn-warning mt-3">
            <IoIosArrowBack className="me-2" />
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='mt-5'></div>

      {/* Hero Section */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6 mt-3">
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/events" className="text-warning text-decoration-none">
                      Events
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={`/events?category=${event.category}`} className="text-warning text-decoration-none">
                      {event.category || 'All Events'}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {event.title || event.eventName}
                  </li>
                </ol>
              </nav>

              <h1 className="display-4 fw-bold text-dark">{event.title || event.eventName}</h1>

              {/* Rating and Reviews */}
              <div className="d-flex align-items-center mb-3">
                <div className="d-flex text-warning me-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-muted">4.8 (128 reviews)</span>
              </div>

              {/* Event Highlights */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge bg-warning text-dark">
                  {event.difficulty || 'All'} Level
                </span>
                <span className="badge bg-success">
                  {event.eventType || 'Special Event'}
                </span>
                <span className="badge bg-info">
                  {event.durationNumber} {event.durationUnit}
                </span>
                {event.isFree && (
                  <span className="badge bg-danger">FREE EVENT</span>
                )}
                {event.enablePromoCode && (
                  <span className="badge bg-primary">DISCOUNT AVAILABLE</span>
                )}
              </div>

              <div className="d-flex align-items-center gap-3 text-muted mb-3">
                <div className="d-flex align-items-center">
                  <MdOutlineLocationOn className="me-2 fs-5" />
                  <span>{event.location || 'Multiple Locations'}</span>
                </div>
                <div className="d-flex align-items-center">
                  <FaRegClock className="me-2 fs-5" />
                  <span>{event.schedule || event.timings || 'Flexible Timing'}</span>
                </div>
              </div>

              {/* Key Benefits */}
              {event.shortDescription && (
                <div className="mb-4 pt-2">
                  <h5 className="fw-semibold mb-2">What You'll Experience</h5>
                  <ul className="list-unstyled">
                    {stripHtml(event.shortDescription).split('.')
                      .filter(point => point.trim().length > 0)
                      .map((point, index) => (
                        <li key={index} className="mb-2">
                          <span className="text-success me-2">✓</span>
                          {point.trim()}
                        </li>
                      ))
                    }
                  </ul>
                </div>
              )}

              {/* Pricing with discount if available */}
              <div className="d-flex align-items-center justify-content-start mb-3">
                {event.enablePromoCode ? (
                  <>
                    <div className="fs-1 fw-bold text-warning me-3">${event.price}</div>
                  </>
                ) : (
                  <div className="fs-1 fw-bold text-warning">${event.price}</div>
                )}
              </div>

              {/* Limited spots warning */}
              {/* {event.maxParticipants && (
                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <FaRegClock className="fs-4 me-2" />
                  <div>
                    <strong>Limited Spots Available!</strong> Only {event.maxParticipants} spots remaining.
                  </div>
                </div>
              )} */}

              <div className="mt-4">
                                           <button
 className="btn btn-warning w-100 rounded-4 btn-md text-decoration-none px-4 py-2 fw-bold"
  onClick={() => handleRegisterClick(event)}
>
 Register Now - Limited Availability!
</button>
                <div className="text-center mt-2">
                  <small className="text-muted">
                    🔒 Secure checkout · Cancel anytime
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6 position-relative">
              <img
                src={event.imageUrl || "/images/kiraOne.png"}
                alt={event.title || event.eventName}
                className="img-fluid rounded-4 shadow"
                style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
              />

              {/* Floating trust badges */}
              <div className="position-absolute bottom-0 start-0 m-3">
                <div className="bg-white rounded-3 p-2 shadow-sm d-flex align-items-center">
                  <div>
                    <div className="small fw-bold">Starts {formatDate(event.eventStartDate)}</div>
                    <div className="text-muted x-small">Register before it's full</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            {/* Left Content */}
            <div className="col-lg-8">

              {/* Overview */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection('overview')}
                >
                  <h4 className="text-lg font-semibold mb-0">Event Overview</h4>
                  {openSections.overview ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.overview && (
                  <div className="mt-3" dangerouslySetInnerHTML={{ __html: event.description || 'No description available' }} />
                )}
              </section>

              {/* Event Details & Schedule */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection('details')}
                >
                  <h4 className="text-lg font-semibold mb-0">Event Details</h4>
                  {openSections.details ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.details && (
                  <div className="d-flex justify-content-between mt-3 gap-4">
                    <div>
                      <h5 className="fw-semibold mb-2">Difficulty</h5>

                      <ul className="list-unstyled">
                        <li><strong>Category:</strong> {event.category || 'Not specified'}</li>
                        <li><strong>Type:</strong> {event.eventType || 'Not specified'}</li>
                        <li><strong>Difficulty:</strong> {event.difficulty || 'Not specified'}</li>
                        <li><strong>Duration:</strong> {event.durationNumber} {event.durationUnit}</li>
                        <li><strong>Max Participants:</strong> {event.maxParticipants || 'Not specified'}</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="fw-semibold mb-2">Schedule</h5>
                      <ul className="list-unstyled">
                        <li><strong>Start Date:</strong> {formatDate(event.eventStartDate)}</li>
                        <li><strong>End Date:</strong> {formatDate(event.eventEndDate)}</li>
                        <li><strong>Timings:</strong> {event.schedule || event.timings}</li>
                        <li><strong>Registration Deadline:</strong> {formatDate(event.registrationDeadline)}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </section>

              {/* Pricing */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection('pricing')}
                >
                  <h4 className="text-lg font-semibold mb-0">Pricing & Registration</h4>
                  {openSections.pricing ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.pricing && (
                  <div className="d-flex justify-content-between mt-3 gap-4">
                    <div>
                      <h5 className="fw-semibold mb-2">Pricing</h5>
                      <ul className="list-unstyled">
                        <li><strong>Price:</strong> ${event.price}</li>
                        {event.earlyBirdPrice && <li><strong>Early Bird Price:</strong> ${event.earlyBirdPrice}</li>}
                        <li><strong>Payment Type:</strong> {event.paymentCategory || 'One-time payment'}</li>
                        <li><strong>Free Event:</strong> {event.isFree ? 'Yes' : 'No'}</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="fw-semibold mb-2">Registration</h5>
                      <ul className="list-unstyled">
                        <li><strong>Promo Code:</strong> {event.enablePromoCode ? event.discountPromoCode : 'Not available'}</li>
                        <li><strong>Online Registration:</strong> {event.allowOnlineRegistration ? 'Available' : 'Not available'}</li>
                        <li><strong>Max Participants:</strong> {event.maxParticipants || 'Not specified'}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </section>

              {/* Location */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection('location')}
                >
                  <h4 className="text-lg font-semibold mb-0">Location Details</h4>
                  {openSections.location ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.location && (
                  <div className="mt-3">
                    <h5 className="fw-bold">{event.locationName || 'Event Location'}</h5>
                    <p className="text-muted"><MdOutlineLocationOn className="me-2" />{event.location || 'Location not specified'}</p>
                    {event.locationDetails?.facilities && (
                      <>
                        <h6 className="fw-semibold mt-3">Facilities Available:</h6>
                        <ul>
                          {event.locationDetails.facilities.map((facility, index) => (
                            <li key={index}>{facility}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {event.whatToBring && (
                      <>
                        <h6 className="fw-semibold mt-3">What to Bring:</h6>
                        <p>{event.whatToBring}</p>
                      </>
                    )}
                    {event.locationMap && (
                      <div className="ratio ratio-16x9 mt-3">
                        <iframe src={event.locationMap} width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" title="Location Map"></iframe>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Additional Information */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection('additional')}
                >
                  <h4 className="text-lg font-semibold mb-0">Additional Information</h4>
                  {openSections.additional ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.additional && (
                  <div className="d-flex justify-content-between mt-3 gap-4">
                    <div>
                      <ul className="list-unstyled">
                        <li><strong>Email Notifications:</strong> {event.triggerEmail ? 'Enabled' : 'Disabled'}</li>
                        <li><strong>What to Bring:</strong> {event.whatToBring || 'Not specified'}</li>
                      </ul>
                    </div>
                    <div>
                      <ul className="list-unstyled">
                        <li><strong>Created:</strong> {formatDate(event.createdAt?.toDate?.())}</li>
                        <li><strong>Last Updated:</strong> {formatDate(event.updatedAt?.toDate?.())}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </section>

              {/* Coaches */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection('coaches')}
                >
                  <h4 className="text-lg font-semibold mb-0">Our Coaches</h4>
                  {openSections.coaches ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.coaches && (
                  <div className="row mt-3">
                    {coaches && coaches.length > 0 ? (
                      coaches.map((coach, index) => (
                        <div key={index} className="col-md-4 col-sm-6 mb-4 text-center">
                          <img
                            src={coach.coachImage || "/images/kiraOne.png"}
                            alt={coach.coachName}
                            className="rounded-circle mb-3"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                          />
                          <h5 className="fw-bold">{coach.coachName}</h5>
                          {coach.coachDescription && <p className="text-muted small">{coach.coachDescription}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="text-center">
                        <p className="text-muted">Our experienced coaching team will be assigned based on your program level and availability.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="col-lg-4">
              <div className="border rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
                <h4 className="fw-bold mb-3">Ready to Join?</h4>
                <p className="text-muted mb-4">Don't miss out on {event.title || event.eventName}!</p>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Price:</span>
                    <span className="fw-bold">${event.price}</span>
                  </div>
                  {event.enablePromoCode && (
                    <div className="text-success small">
                      <strong>Promo Code:</strong> {event.discountPromoCode}
                    </div>
                  )}
                </div>

                                                           <button
                  className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
                  onClick={() => handleRegisterClick(event)}
                >
                  Register Now 
                </button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Have questions? <Link to="/" className="text-warning">Contact us</Link>
                  </small>
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

export default EventDetail
