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
