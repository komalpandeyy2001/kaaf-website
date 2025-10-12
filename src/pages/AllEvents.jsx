import React, { useState, useEffect } from 'react'
import { FaRegClock, FaRegEnvelope } from 'react-icons/fa6'
import { IoIosArrowForward } from 'react-icons/io'
import { MdOutlineLocationOn } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'
import Footer from '../../Components/Footer'
import StayGame from '../../Components/StayGame'
import { getCollectionData } from './Firebase/CloudFirestore/GetData'

function AllEvents() {
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const [eventsData, setEventsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const categories = ['All Events', 'Tournaments', 'Camps', 'Workshops', 'Social', 'Corporate']

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl)
    }
    fetchEvents()
  }, [searchParams])

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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (category === 'All Events') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams)
  }

  if (loading) {
    return (
      <>
        <div className="text-center mt-5 pt-5">Loading events...</div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="text-center mt-5 pt-5 text-danger">{error}</div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <div className='mt-5 '></div>

      {/* first section */}
      <section>
        <div className='cta-events'>
          <div className='container text-center text-white'>
            <div className=' fw-bold display-md-4 fs-1' >All <span className='text-yellow'>Events</span></div>
            <div className='fs-md-4 fs-6 fw-semibold text-white'>Explore all our events, tournaments, and special activities</div>
          </div>
        </div>
      </section>

      {/* category filter */}
      <section className='container my-5'>
        <div className='text-center mb-5'>
          <div className='d-flex justify-content-center gap-3 flex-wrap'>
            {categories.map((category) => (
              <button
                key={category}
                className={`btn btn-sm rounded-3 px-4 py-2 fw-bold ${selectedCategory === category
                  ? 'btn-warning text-dark'
                  : 'btn-outline-warning text-dark'
                  }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* all events cards */}
      <section className='my-5 pb-5'>
        <div className='container'>
          {filteredEvents.length === 0 && (
            <div className="text-center fs-4 py-5">No events found for the selected category.</div>
          )}
          <div className='row justify-content-center align-items-start g-4'>
            {filteredEvents.map((event) => (
              <div key={event.id} className='col-12 col-md-6 col-lg-4'>
                <div className='rounded-4 shadow h-100'>
                  <img
                    src={event.imageUrl || event.image || "/images/kiraOne.png"}
                    alt={event.title || event.programName}
                    className="img-fluid mb-3 p-0 rounded-top"
                    style={{ maxHeight: '220px', width: '100%', objectFit: 'cover' }}
                  />
                  <div className='px-4 pb-4'>
                    <div className='fs-4 text-start fw-semibold'>{event.title || event.programName}</div>
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
                    <div className='d-flex justify-content-between align-items-center mt-3'>
                      <div className='fs-5 fw-semibold'>${event.price || '0'} per month</div>
                      <Link
                        to="/registration"
                        state={{
                          programName: event.title || event.programName,
                          programId: event.id,
                          price: event.price || '0',
                          source: 'events'
                        }}
                        className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
                      >
                        Register Now <IoIosArrowForward />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StayGame />
      <Footer />
    </>
  )
}

export default AllEvents
