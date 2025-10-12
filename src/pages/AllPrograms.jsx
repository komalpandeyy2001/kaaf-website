import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaRegClock } from 'react-icons/fa6'
import { IoIosArrowForward } from 'react-icons/io'
import { MdOutlineLocationOn } from 'react-icons/md'
import Footer from '../../Components/Footer'
import StayGame from '../../Components/StayGame'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './Firebase/firebase'

function AllPrograms() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programsCollection = collection(db, 'programs')
        const programSnapshot = await getDocs(programsCollection)
        const programList = programSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setPrograms(programList)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching programs:', err)
        setError('Failed to load programs. Please try again later.')
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  if (loading) {
    return (
      <>
        <div className="text-center mt-5 pt-5">Loading programs...</div>
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
        <div className='cta'>
          <div className='container text-center text-white'>
            <div className='text-yellow fw-bold display-3'>All Programs</div>
            <div className='fs-4 fw-semibold text-white'>Discover all our programs to elevate your game and achieve your goals.</div>
          </div>
        </div>
      </section>

      {/* all programs cards */}
      <section className='my-5 pb-5'>
        <div className='container'>
          {programs.length === 0 && (
            <div className="text-center fs-4 py-5">No programs available at the moment.</div>
          )}
          <div className='row justify-content-center align-items-start g-4'>
            {programs.map(program => (
              <div key={program.id} className='col-12 col-md-6 col-lg-4'>
                <div className='rounded-4 shadow h-100'>
                  <img
                    src={program.imageUrl || "/images/kiraOne.png"}
                    alt={program.programName}
                    className="img-fluid mb-3 p-0 rounded-top"
                    style={{ maxHeight: '220px', width: '100%', objectFit: 'cover' }}
                  />
                  <div className='px-4 pb-4'>
                    <div className='fs-4 text-start fw-semibold'>{program.programName}</div>
                    <div className='items-start ps-3 pt-2 fs-6 fw-semibold text-gray'>
                      <MdOutlineLocationOn className='me-2 fs-5 text-dark' /> {program.location || 'Location not specified'}
                    </div>
                    <div className='items-start ps-3 fs-6 fw-semibold text-gray'>
                      <FaRegClock className='text-dark me-2 fs-5 ps-1' /> {program.timings || 'Timing not specified'}
                    </div>
                    <div className='fs-6 fw-semibold mt-3'>{stripHtml(program.shortDescription || '')}</div>
                    <div className='fs-6 fw-semibold mt-3'>
                      <div dangerouslySetInnerHTML={{ __html: program.description || '' }} />
                    </div>
                    <div className='d-flex justify-content-between align-items-center mt-3'>
                      <div className='fs-5 fw-semibold'>${program.price} per month</div>
                      <Link
                        to="/registration"
                        state={{
                          programId: program.id,
                          programName: program.programName,
                          price: program.price,
                          source: 'programs'
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

export default AllPrograms
