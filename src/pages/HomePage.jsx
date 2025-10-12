import { useState, useEffect, useMemo } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './Firebase/firebase'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import './homepage.css'
import { submitGetInTouchForm } from './Firebase/CloudFirestore/GetInTouchService'
import { validateAndFixImageUrl } from './Firebase/CloudStorage/GetImageURL'
import { toast } from 'react-toastify';

import Footer from '../../Components/Footer';
import Header from '../../Components/Header';
import { IoIosArrowDropright } from "react-icons/io";
import { MdOutlineLocationOn } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { FiFacebook } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { BiMessageAdd } from "react-icons/bi";
import { BiPhoneCall } from "react-icons/bi";
import { FaRegEnvelope } from "react-icons/fa6";
import StayGame from '../../Components/StayGame';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation'; // if you want arrows
import { Navigation } from 'swiper/modules';
import { isUserLoggedIn } from '../utils/authState'
import { Gallery } from './Gallery'

function HomePage() {
    const [email, setEmail] = useState('')
    const [programs, setPrograms] = useState([]) // State for programs
    const [loading, setLoading] = useState(true) // Loading state
    const [error, setError] = useState(null) // Error state
    const [visiblePrograms, setVisiblePrograms] = useState(2) // Number of programs to show initially
    const [homeData, setHomeData] = useState(null) // State for home page data
    const [homeLoading, setHomeLoading] = useState(true) // Loading state for home data
    const [homeError, setHomeError] = useState(null) // Error state for home data
    const navigate = useNavigate();

    // Get In Touch form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState('')
    const [submitError, setSubmitError] = useState('')

    const handleRegisterClick = (program) => {
        if (isUserLoggedIn()) {
            navigate('/registration', {
                state: {
                    programId: program.id,
                    programName: program.programName,
                    price: program.price,
                    source: 'programs',
                },
            });
        } else {
            toast.success('Please sign up to register for programs.');

            const params = new URLSearchParams({
                redirect: '/registration',
                programId: program.id,
                programName: program.programName,
                price: program.price,
            });

            navigate(`/login?${params.toString()}`);
        }
    };

    const handleBookSession = () => {
        if (isUserLoggedIn()) {
            navigate("/book-class");
        } else {
            toast.info("Please sign in to book a class.");
            navigate(`/login?redirect=/book-class`);
        }
    };

    const fetchHomeData = async () => {
        try {
            const docRef = doc(db, 'webDesign', 'homePage');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Process sections to organize them by their id
                if (data.sections && Array.isArray(data.sections)) {
                    const processedSections = {};
                    data.sections.forEach(section => {
                        if (section.id) {
                            processedSections[section.id] = section;
                            console.log(`Section ${section.id} imageUrl:`, section.imageUrl);
                        }
                    });

                    // Set the processed data with sections organized by id
                    setHomeData({
                        ...data,
                        processedSections
                    });
                } else {
                    setHomeData(data);
                }
            } else {
                console.log("No home page document found!");
                setHomeError('Failed to load home data. Please try again later.');
            }
        } catch (err) {
            console.error('Error fetching home data:', err);
            setHomeError('Failed to load home data. Please try again later.');
        } finally {
            setHomeLoading(false);
        }
    }

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
            } catch (err) {
                console.error('Error fetching programs:', err)
                setError('Failed to load programs. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchPrograms();
        fetchHomeData();
    }, [])

    const handleSubscribe = (e) => {
        e.preventDefault()
        toast.success(`Thank you for subscribing with ${email}!`)
        setEmail('')
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitMessage('')
        setSubmitError('')

        try {
            await submitGetInTouchForm(formData)
            setSubmitMessage('Thank you for your message! We\'ll get back to you soon.')
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            })
        } catch (error) {
            setSubmitError('Failed to send message. Please try again later.')
            console.error('Error submitting form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const stripHtml = (html) => {
        const tmp = document.createElement('div')
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ''
    }

    // Memoize image URLs to prevent unnecessary re-renders
    const section2ImageUrl = useMemo(() => {
        return homeData?.processedSections?.['2']?.imageUrl
            ? validateAndFixImageUrl(homeData.processedSections['2'].imageUrl)
            : null;
    }, [homeData?.processedSections?.['2']?.imageUrl]);


    console.log("Section 2 image path:", "/images/cypherOne.png");

    return (
        <div className="App">
            {/* Header */}
            <Header />
            <div className='mt-5 '></div>

            {/* Render Sections Based on the section key */}
            {homeLoading ? (
                <div className="text-center py-5">Loading home section...</div>
            ) : homeError ? (
                <div className="text-center text-danger py-5">{homeError}</div>
            ) : homeData && homeData.processedSections ? (
                <>
                    {homeData.processedSections['1'] && homeData.processedSections['1'].isVisible !== false && (
                        <section
                            className="background-section"
                            style={{
                                backgroundImage: `url(${homeData.processedSections["1"].imageUrl || "/images/background.png"})`,
                            }}
                        >
                            <div className="background-content container">
                                <div className="row justify-content-start">
                                    <div className="col-12 col-md-8 col-lg-5">
                                        <div className="text-start text-white position-relative">
                                            <div className="display-5 mb-4">
                                                {homeData.processedSections["1"].heading}
                                            </div>
                                            <div
                                                className="lead mb-4 fw-semibold"
                                                dangerouslySetInnerHTML={{
                                                    __html: homeData.processedSections["1"].description,
                                                }}
                                            />
                                            <div className="d-flex gap-3 align-items-center">
                                                <button
                                                    className="btn session-button btn-lg text-nowrap px-4 py-2 "
                                                    onClick={handleBookSession}
                                                >
                                                    Book a class
                                                </button>
                                                <a
                                                    href="#get-in-touch"
                                                    className="btn text-white btn-lg px-4 py-2 text-nowrap"
                                                >
                                                    Contact Us <IoIosArrowDropright className="mb-1" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    )}

                </>
            ) : (
                <div className="text-center py-5">No home data available</div>
            )}

            {/* Section 2 */}
            {homeLoading ? (
                <div className="text-center py-5">Loading sections...</div>
            ) : homeError ? (
                <div className="text-center text-danger py-5">{homeError}</div>
            ) : homeData && homeData.sections ? (
                <>
                    {homeData.sections
                        .filter(section => section.isVisible !== false && section.id !== "1") // exclude id=1
                        .map(section => (
                            <section key={section.id} className="p-4 bg-light">
                                <div className="row align-items-center g-4 section-row">
                                    {/* Image when order is left */}
                                    {section.order === "left" && (
                                        <div className="col-12 col-md-6">
                                            <div className="section-image-wrapper">
                                                <img
                                                    src={section.imageUrl || "/images/cypherOne.png"}
                                                    alt={section.heading}
                                                    className="section-image"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Text content */}
                                    <div className="col-12 col-md-6 section-text">
                                        <div>
                                            <div className="fw-bold fs-2">{section.heading}</div>
                                            <div
                                                className="fs-6 mb-2"
                                                dangerouslySetInnerHTML={{ __html: section.description }}
                                            />
                                        </div>
                                    </div>

                                    {/* Image when order is right */}
                                    {section.order === "right" && (
                                        <div className="col-12 col-md-6">
                                            <div className="section-image-wrapper">
                                                <img
                                                    src={section.imageUrl || "/images/cypherOne.png"}
                                                    alt={section.heading}
                                                    className="section-image"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                        ))}
                </>
            ) : (
                <div className="text-center py-5">No sections available</div>
            )}

            <Gallery galleries={homeData?.galleries} />
            {/* section 3 */}
            <section className="vector-section ">
                <div className=" text-center">
                    <img
                        src="/images/Vector.png"
                        alt="Vector Design"
                        className=""
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            </section>

            {/* section 4  */}
            <section className='mb-5 pb-5'>
                <div className='d-flex flex-column align-items-center justify-content-center gap-3 py-5'>
                    <div className='fs-1 fw-bold text-center'>Our Programs</div>
                    <div className='fs-5 text-center items-center w-75 '>
                        Choose from our age-appropriate programs designed to develop skills, build
                        confidence, and foster a love for soccer.
                    </div>
                </div>

                <div className='container '>
                    <div className='row justify-content-center align-items-start g-4'>
                        {loading ? (
                            <div className="text-center">Loading programs...</div>
                        ) : error ? (
                            <div className="text-center text-danger">{error}</div>
                        ) : (
                            <>
                                {programs
                                    .filter(program => program.isVisible !== false)
                                    .slice(0, visiblePrograms)
                                    .map(program => (
                                        <div key={program.id} className='col-12 col-md-6 col-lg-4 col-xl-5'>
                                            <div className='rounded-4 shadow h-100'>
                                                <img
                                                    src={program.imageUrl || "/images/kiraOne.png"}
                                                    alt={program.programName}
                                                    className="img-fluid mb-3 p-0 rounded-top"
                                                    style={{ maxHeight: '220px', width: '100%', objectFit: 'cover' }}
                                                />
                                                <div className='px-4 pb-4'>
                                                    <div className="d-flex flex-column flex-md-row justify-content-between md-align-items-center mt-3">
                                                        <div className="fs-5 fw-semibold">{program.programName}</div>
                                                        <div className="fs-5 fw-semibold">${program.price} per month</div>
                                                    </div>

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
                                                    <div className="d-flex justify-content-between align-items-center mt-3 gap-2">
                                                        <Link
                                                            to={`/program/${program.id}`}
                                                            className="btn btn-outline-warning rounded-3 btn-md fs-6 px-3 py-2 text-decoration-none text-nowrap"
                                                        >
                                                            View Details
                                                        </Link>

                                                        <button
                                                            className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none text-nowrap"
                                                            onClick={() => handleRegisterClick(program)}
                                                        >
                                                            Register Now <IoIosArrowForward />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {programs.filter(program => program.isVisible !== false).length > visiblePrograms && (
                                    <div className='text-center mt-4'>
                                        <button
                                            onClick={() => setVisiblePrograms(prev => Math.min(prev + 3, programs.filter(program => program.isVisible !== false).length))}
                                            className="btn btn-custom-yellow btn-lg fs-5 px-4 py-2"
                                        >
                                            More Programs <IoIosArrowForward />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* section 5  */}
            <section style={{ backgroundColor: '#ff0000ff' }} className="py-5">
                <div className="d-flex flex-column align-items-center justify-content-center gap-3 py-5">
                    <div className="fs-1 fw-bold text-center text-white">Zalles Retail</div>
                    <div className="fs-4 text-center w-75 text-white">
                        Premium featured products and equipment with exclusive offers
                    </div>
                </div>

                <div className="container">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={20}
                        slidesPerView={2} // Show 2 on mobile
                        navigation
                        breakpoints={{
                            768: { slidesPerView: 3 }, // 3 on md and up
                            992: { slidesPerView: 4 }, // 4 on lg and up
                        }}
                    >
                        {[
                            {
                                image: '/images/shoe1.png',
                                title: 'Babolat Propulse Fury Men - Black/Red',
                                price: '$89',
                            },
                            {
                                image: '/images/shoe2.png',
                                title: 'Nike Court Zoom Pro - White/Blue',
                                price: '$120',
                            },
                            {
                                image: '/images/shoe3.png',
                                title: 'Adidas SoleCourt Boost - Grey/Black',
                                price: '$99',
                            },
                            {
                                image: '/images/shoe4.png',
                                title: 'Asics Gel Resolution 8 - Blue/Orange',
                                price: '$110',
                            },
                        ].map((product, index) => (
                            <SwiperSlide key={index}>
                                <div className="rounded-4 text-white h-100 p-3">
                                    <img src={product.image} alt="Shoe" className="img-fluid mb-2" />

                                    {/* Star Rating */}
                                    <div style={{ color: '#ffc107', fontSize: '1.5rem' }}>
                                        ★★★★☆
                                    </div>

                                    {/* Product Info */}
                                    <div className="fw-bold">{product.title}</div>

                                    {/* Price & Arrow Row */}
                                    <div className="d-flex justify-content-between align-items-center fw-bold mt-2">
                                        <span>{product.price}</span>
                                        <IoIosArrowForward style={{ fontSize: '1.8rem' }} />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>


                </div>
            </section>

            {/* section 6  */}
            {/* {homeLoading ? (
                <div className="text-center py-5">Loading membership section...</div>
            ) : homeError ? (
                <div className="text-center text-danger py-5">{homeError}</div>
            ) : homeData && homeData.processedSections && homeData.processedSections['1756362504920'] ? (
                <section>
                    <div className='cta'>
                        <div className='col-1 col-md-1 col-lg-5   '></div>
                        <div className=' text-dark col-10 col-md-10 col-lg-6'>
                            <div className='bg-white px-5 py-4 rounded-5'>
                                <div className='fs-2  fw-bold'>{homeData.processedSections['1756362504920'].heading}</div>
                                <div className='fs-6' dangerouslySetInnerHTML={{ __html: homeData.processedSections['1756362504920'].description }} />
                                <div className='d-flex mt-3  align-items-center'>
                                    <button
                                        className="btn session-button btn-lg"
                                        onClick={handleBookSession}
                                    >
                                        Book a session
                                    </button>
                                    <a href="#get-in-touch" className="btn text-dark btn-lg px-4 py-2">
                                        Contact Us <span className='mb-2'><IoIosArrowDropright /></span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="text-center py-5">No membership data available</div>
            )} */}

            {/* get in touch seciton */}
            <section id="get-in-touch" className="py-5 my-5">
                <div className="container">
                    <div className="d-flex flex-column align-items-center justify-content-center text-center mb-5">
                        <div className="fs-1 fw-semibold">Get In Touch</div>
                        <div className="fs-4 fw-semibold text-gray">
                            Ready to join the <span className='text-dark'>Bee Tennis Studio</span> family? Contact us today!
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        {/* Form first on small, right side on md+ */}
                        <div className='col-12 col-md-7 col-lg-8 order-1 order-md-2'>
                            <div className='mb-4 fw-bold fs-4'>Send Us a Message</div>
                            <form onSubmit={handleFormSubmit}>
                                {/* Success/Error Messages */}
                                {submitMessage && (
                                    <div className="alert alert-success mb-4" role="alert">
                                        {submitMessage}
                                    </div>
                                )}
                                {submitError && (
                                    <div className="alert alert-danger mb-4" role="alert">
                                        {submitError}
                                    </div>
                                )}

                                {/* Name and Email */}
                                <div className="row mb-4">
                                    <div className="col">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            className="form-control form-control-md"
                                            placeholder="Your Name"
                                            required
                                        />
                                    </div>
                                    <div className="col">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            className="form-control form-control-md"
                                            placeholder="Your Email"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleFormChange}
                                        className="form-control form-control-md"
                                        placeholder="Subject"
                                        required
                                    />
                                </div>

                                {/* Message */}
                                <div className="mb-4">
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleFormChange}
                                        className="form-control form-control-md"
                                        rows="6"
                                        placeholder="Your Message"
                                        required
                                    ></textarea>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="btn btn-custom-yellow btn-lg rounded-3 fs-5 w-100 py-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Submit'}
                                </button>
                            </form>
                        </div>

                        {/* Contact info second on small, left side on md+ */}
                        <div className='col-12 col-sm-12 col-md-5 col-lg-4 order-2 order-md-1 mt-5 mt-md-0'>
                            <div className='mb-4 fw-bold fs-4'>Contact Information</div>

                            {/* 2 in a row on <md, 1 per row on md+ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 text-lg font-semibold">
                                {/* Location */}
                                <div className="flex items-center gap-2 text-2xl">
                                    <MdOutlineLocationOn className="text-2xl text-black" />
                                    Foster City, California
                                </div>

                                {/* Message */}
                                <div className="flex items-center gap-2">
                                    <BiMessageAdd className="mr-2 text-2xl text-black" />
                                    (206) 555-1234
                                </div>

                                {/* Phone */}
                                <div className="flex items-center gap-2">
                                    <BiPhoneCall className="mr-2 text-2xl text-black" />
                                    info@beetennisstudio.com
                                </div>

                                {/* Hours */}
                                <div className="flex items-center gap-2">
                                    <FaRegClock className="mr-2 text-2xl text-black" />
                                    Mon - Fri | 9 AM to 6 PM
                                </div>
                            </div>


                            <div className="mt-5 text-center text-md-start">
                                <div className="fw-bold fs-4">Follow Us</div>
                                <div className="d-flex gap-3 mt-2 fs-3 justify-content-center justify-content-md-start">
                                    <FiFacebook />
                                    <AiOutlineYoutube />
                                    <FaInstagram />
                                </div>
                            </div>

                        </div>

                    </div>


                </div>
            </section>
            <StayGame />
            <Footer />
        </div>
    )
}

export default HomePage
