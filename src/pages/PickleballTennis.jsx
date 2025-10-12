import React, { useState, useEffect } from 'react'
import { IoFootballOutline } from 'react-icons/io5'
import StayGame from '../../Components/StayGame'
import Footer from '../../Components/Footer'
import { getDocumentData } from './Firebase/CloudFirestore/GetData'

function PickleballTennis() {
  const [sections, setSections] = useState([])
  const [pageSettings, setPageSettings] = useState({
    title: 'Pickleball',
    description: 'Discover the fastest-growing sport in America and ',
    heroImage: '',
  })
  const [whyChooseUs, setWhyChooseUs] = useState({
    textField: 'Why Choose Us?',
    content: 'At Zalles Racquet Sports, we\'re dedicated to providing our customers with the best selection of pickleball products at competitive prices. Our knowledgeable staff is passionate about the sport and always ready to help you find the perfect gear for your needs. With our commitment to quality and customer satisfaction, you can trust us to provide top-notch products and exceptional service every time.'
  })
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fallback images for pickleball sections
  const pickleballFallbackImages = [
    '/images/pickleball-one.png',
    '/images/pickleball-two.png',
    '/images/pickleball-three.png',
    '/images/pickleball-four.png',
    '/images/pickleball-five.png'
  ]

  // Image error handler to set fallback
  const handleImageError = (e, index) => {
    const fallbackIndex = index % pickleballFallbackImages.length
    e.target.src = pickleballFallbackImages[fallbackIndex]
  }

  useEffect(() => {
    const fetchPickleballData = async () => {
      try {
        // Fetch pickleball page data
        const pickleballData = await getDocumentData('webDesign', 'pickleBall')
        if (pickleballData) {
          // Set page settings
          if (pickleballData.pageSettings) {
            setPageSettings({
              title: pickleballData.pageSettings.title || 'Pickleball',
              description: pickleballData.pageSettings.description || 'Discover the fastest-growing sport in America and Europe',
              heroImage: pickleballData.pageSettings.heroImage || '',
            })
          }
          
          // Set last updated
          setLastUpdated(pickleballData.lastUpdated || '')
          
          // Set sections - filter out invisible sections
          if (pickleballData.sections) {
            const visibleSections = pickleballData.sections.filter(section => section.isVisible !== false)
            setSections(visibleSections.sort((a, b) => a.order - b.order))
          }
        }

        // Fetch whyChooseUs data
        const whyChooseUsData = await getDocumentData('webDesign', 'whyChooseUs')
        if (whyChooseUsData) {
          setWhyChooseUs({
            textField: whyChooseUsData.textField || 'Why Choose Us?',
            content: whyChooseUsData.content || whyChooseUs.content
          })
        }

        setLoading(false)
      } catch (err) {
        console.error('Error fetching pickleball data:', err)
        setError('Failed to load content')
        setLoading(false)
      }
    }

    fetchPickleballData()
  }, [])

  if (loading) {
    return (
      <>
        <div className='mt-5'></div>
        <div className='d-flex justify-content-center align-items-center' style={{ height: '50vh' }}>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className='mt-5'></div>
        <div className='container text-center py-5'>
          <h2>Error Loading Content</h2>
          <p>{error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className='mt-5'></div>

      {/* Hero Section with dynamic data */}
      <section>
        <div 
          className='cta-events' 
          style={{ 
            backgroundImage: pageSettings.heroImage 
              ? `url(${pageSettings.heroImage})` 
              : "url('/images/BookClass-second.png')" 
          }}
        >
          <div className='container text-center text-white'>
            <div className='fw-bold display-3 text-yellow'>{pageSettings.title}</div>
            <div className='fs-4 fw-semibold text-white'>{pageSettings.description}</div>
           
          </div>
        </div>
      </section>

      {/* Dynamic Sections */}
      {sections.map((section, index) => (
        <section key={index} className="py-5 bg-light">
          <div className="container">
            <div className={`row align-items-center justify-content-center g-4 ${section.order === 'right' ? 'flex-row-reverse' : ''}`}>
              <div className="col-12 col-md-6">
                <img
                  src={section.imageUrl || section.image || pickleballFallbackImages[index % pickleballFallbackImages.length]}
                  alt={section.heading || 'Pickleball section'}
                  className="img-fluid w-100"
                  style={{ objectFit: 'cover', maxHeight: '400px' }}
                  onError={(e) => handleImageError(e, index)}
                />
              </div>
              <div className="col-12 col-md-6">
                <div>
                  <div className="fw-bold fs-2 fs-md-1 mb-3">{section.heading}</div>
                  <div 
                    className="fs-5 fs-md-4 mb-4"
                    dangerouslySetInnerHTML={{ __html: section.description }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="py-5 bg-white">
        <div className="container text-center">
          <div className="mb-4">
            <h2 className="fw-bold display-5">{whyChooseUs.textField}</h2>
          </div>
          <div className="mx-auto" style={{ maxWidth: '800px' }}>
            <p className="fs-5 text-secondary">
              {whyChooseUs.content}
            </p>
          </div>
        </div>
      </section>

      <StayGame />
      <Footer />
    </>
  )
}

export default PickleballTennis
