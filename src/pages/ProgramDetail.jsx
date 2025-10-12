import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase/firebase";
import { getCollectionData } from "./Firebase/CloudFirestore/GetData";
import Footer from "../../Components/Footer";
import StayGame from "../../Components/StayGame";
import { FaRegClock, FaPlus, FaMinus } from "react-icons/fa6";
import { MdOutlineLocationOn } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import { isUserLoggedIn } from "../utils/authState";
import { toast } from "react-toastify";

function ProgramDetail() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [openSections, setOpenSections] = useState({
    overview: true,
    details: true,
    pricing: false,
    classes: false,
    sessions: false,
    location: false,
    coaches: false,
    additional: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const programDoc = doc(db, "programs", id);
        const programSnapshot = await getDoc(programDoc);

        if (programSnapshot.exists()) {
          setProgram({
            id: programSnapshot.id,
            ...programSnapshot.data(),
          });
        } else {
          setError("Program not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching program:", err);
        setError("Failed to load program details. Please try again later.");
        setLoading(false);
      }
    };

    const fetchCoaches = async () => {
      try {
        const coachesData = await getCollectionData("coaches");
        setCoaches(coachesData);
      } catch (err) {
        console.error("Error fetching coaches:", err);
      }
    };

    fetchProgram();
    fetchCoaches();
  }, [id]);
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>{error}</h4>
          <Link to="/programs" className="btn btn-warning ">
            <IoIosArrowBack className="me-2" />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }
  const handleRegisterClick = (program) => {
    if (isUserLoggedIn()) {
      navigate("/registration", {
        state: {
          programId: program.id,
          programName: program.programName,
          price: program.price,
          source: "programs",
        },
      });
    } else {
      toast.success("Please sign signin to register for programs.");

      const params = new URLSearchParams({
        redirect: "/registration",
        programId: program.id,
        programName: program.programName,
        price: program.price,
      });

      navigate(`/login?${params.toString()}`);
    }
  };

  if (!program) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <h4>Program not found</h4>
          <Link to="/programs" className="btn btn-warning mt-3">
            <IoIosArrowBack className="me-2" />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-5"></div>

      {/* Hero Section */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6 mt-3">
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link
                      to="/programs"
                      className="text-warning text-decoration-none"
                    >
                      Programs
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link
                      to={`/programs?category=${program.category}`}
                      className="text-warning text-decoration-none"
                    >
                      {program.category}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {program.programName}
                  </li>
                </ol>
              </nav>

              <h1 className="display-4 fw-bold text-dark">
                {program.programName}
              </h1>

              {/* Rating and Reviews */}
              <div className="d-flex align-items-center mb-3">
                <div className="d-flex text-warning me-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-muted">4.8 (128 reviews)</span>
              </div>

              {/* Program Highlights */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge bg-warning text-dark">
                  {program.difficulty} Level
                </span>
                <span className="badge bg-success">
                  {program.numberOfClasses} Sessions
                </span>
                <span className="badge bg-info">
                  {program.durationNumber} {program.durationUnit}
                </span>
                {program.isFree && (
                  <span className="badge bg-danger">FREE TRIAL</span>
                )}
                {program.enablePromoCode && (
                  <span className="badge bg-primary">DISCOUNT AVAILABLE</span>
                )}
              </div>

              <div className="d-flex align-items-center gap-3 text-muted mb-3">
                <div className="d-flex align-items-center">
                  <MdOutlineLocationOn className="me-2 fs-5" />
                  <span>{program.location || "Multiple Locations"}</span>
                </div>
                <div className="d-flex align-items-center">
                  <FaRegClock className="me-2 fs-5" />
                  <span>{program.timings || "Flexible Timing"}</span>
                </div>
              </div>

              {/* Key Benefits */}
              {program.shortDescription && (
                <div className="mb-4 pt-2">
                  <h5 className="fw-semibold mb-2"> What You'll Get</h5>
                  <ul className="list-unstyled">
                    {stripHtml(program.shortDescription)
                      .split(".")
                      .filter((point) => point.trim().length > 0)
                      .map((point, index) => (
                        <li key={index} className="mb-2">
                          <span className="text-success me-2">✓</span>
                          {point.trim()}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Pricing with discount if available */}
              <div className="d-flex align-items-center justify-content-start mb-3">
                {program.enablePromoCode ? (
                  <>
                    <div className="fs-1 fw-bold text-warning me-3">
                      ${program.price}
                    </div>
                  </>
                ) : (
                  <div className="fs-1 fw-bold text-warning">
                    ${program.price}
                  </div>
                )}
              </div>

              {/* Limited spots warning */}
              {program.classes && program.classes[0]?.capacity && (
                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <FaRegClock className="fs-4 me-2" />
                  <div>
                    <strong>Limited Spots Available!</strong> Only{" "}
                    {program.classes.reduce(
                      (min, cls) => Math.min(min, cls.capacity || Infinity),
                      Infinity
                    )}{" "}
                    spots remaining across all classes.
                  </div>
                </div>
              )}

              <div className="mt-4">
                <button
                  className="btn btn-warning w-100 rounded-4 btn-md text-decoration-none px-4 py-2 fw-bold"
                  onClick={() => handleRegisterClick(program)}
                >
                  Enroll Now - Limited Availability!
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
                src={program.imageUrl || "/images/kiraOne.png"}
                alt={program.programName}
                className="img-fluid rounded-4 shadow"
                style={{
                  maxHeight: "400px",
                  width: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Floating trust badges */}
              <div className="position-absolute bottom-0 start-0 m-3">
                <div className="bg-white rounded-3 p-2 shadow-sm d-flex align-items-center">
                  <div>
                    <div className="small fw-bold">
                      Starts {formatDate(program.programStartDate)}
                    </div>
                    <div className="text-muted x-small">
                      Enroll before it's full
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            {/* Left Content */}
            <div className="col-lg-8">
              {/* Overview */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection("overview")}
                >
                  <h4 className="text-lg font-semibold mb-0">
                    Program Overview
                  </h4>
                  {openSections.overview ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.overview && (
                  <div
                    className="mt-3"
                    dangerouslySetInnerHTML={{
                      __html: program.description || "No description available",
                    }}
                  />
                )}
              </section>

              {/* Program Details & Schedule */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection("details")}
                >
                  <h4 className="text-lg font-semibold mb-0">
                    Program Details
                  </h4>
                  {openSections.details ? <FaMinus /> : <FaPlus />}
                </div>

                {openSections.details && (
                  <div className="d-flex justify-content-between mt-3 gap-4">
                    {/* Program Details - Left */}
                    <div className="flex-fill">
                      <h5 className="fw-semibold mb-2">Details</h5>
                      <ul className="list-unstyled mb-0">
                        <li>
                          <strong>Category:</strong> {program.category}
                        </li>
                        <li>
                          <strong>Type:</strong> {program.programType}
                        </li>
                        <li>
                          <strong>Difficulty:</strong> {program.difficulty}
                        </li>
                        <li>
                          <strong>Duration:</strong> {program.durationNumber}{" "}
                          {program.durationUnit}
                        </li>
                        <li>
                          <strong>Classes:</strong> {program.numberOfClasses}{" "}
                          total
                        </li>
                        <li>
                          <strong>Classes per week:</strong>{" "}
                          {program.classesPerWeek || "Not specified"}
                        </li>
                      </ul>
                    </div>

                    {/* Schedule - Right */}
                    <div className="flex-fill">
                      <h5 className="fw-semibold mb-2">Schedule</h5>
                      <ul className="list-unstyled mb-0">
                        <li>
                          <strong>Start Date:</strong>{" "}
                          {formatDate(program.programStartDate)}
                        </li>
                        <li>
                          <strong>End Date:</strong>{" "}
                          {formatDate(program.programEndDate)}
                        </li>
                        <li>
                          <strong>Timings:</strong> {program.timings}
                        </li>
                        <li>
                          <strong>Session Unit:</strong> {program.sessionUnit}
                        </li>
                        <li>
                          <strong>Sessions per week:</strong>{" "}
                          {program.sessionsPerWeek || "Not specified"}
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </section>

              {/* Pricing */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection("pricing")}
                >
                  <h4 className="text-lg font-semibold mb-0">
                    Pricing & Promotions
                  </h4>
                  {openSections.pricing ? <FaMinus /> : <FaPlus />}
                </div>

                {openSections.pricing && (
                  <div className="d-flex justify-content-between mt-3 gap-4 flex-column flex-md-row">
                    {/* Pricing - Left */}
                    <div className="flex-fill">
                      <h5 className="fw-semibold mb-2">Pricing</h5>
                      <ul className="list-unstyled mb-0">
                        <li>
                          <strong>Price:</strong> ${program.price}
                        </li>
                        {/* {program.pricePerWeek && (
            <li><strong>Price per week:</strong> ${program.pricePerWeek}</li>
          )} */}
                        <li>
                          <strong>Payment Type:</strong>{" "}
                          {program.paymentCategory}
                        </li>
                        <li>
                          <strong>Free Program:</strong>{" "}
                          {program.isFree ? "Yes" : "No"}
                        </li>
                      </ul>
                    </div>

                    {/* Promotions - Right */}
                    <div className="flex-fill">
                      <h5 className="fw-semibold mb-2">Promotions</h5>
                      <ul className="list-unstyled mb-0">
                        <li>
                          <strong>Promo Code:</strong>{" "}
                          {program.enablePromoCode
                            ? program.discountPromoCode
                            : "Not available"}
                        </li>
                        <li>
                          <strong>Online Purchase:</strong>{" "}
                          {program.allowOnlinePurchasing
                            ? "Available"
                            : "Not available"}
                        </li>
                        <li>
                          <strong>Carry Over Credits:</strong>{" "}
                          {program.carryOverUnused ? "Yes" : "No"}
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </section>

              {/* Classes */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection("classes")}
                >
                  <h4 className="text-lg font-semibold mb-0">Classes</h4>
                  {openSections.classes ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.classes && (
                  <div className="row mt-3">
                    {program.classes && program.classes.length > 0 ? (
                      program.classes.map((classItem, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="border rounded p-3 h-100">
                            <h5 className="fw-bold">
                              {classItem.name || `Class ${index + 1}`}
                            </h5>
                            <p className="mb-1">
                              <strong>Duration:</strong>{" "}
                              {classItem.duration || program.durationNumber}{" "}
                              {classItem.durationUnit || program.durationUnit}
                            </p>
                            <p className="mb-1">
                              <strong>Level:</strong>{" "}
                              {classItem.level || program.difficulty}
                            </p>
                            <p className="mb-1">
                              <strong>Capacity:</strong>{" "}
                              {classItem.capacity || "Not specified"} students
                            </p>
                            <p className="mb-0">
                              <strong>Description:</strong>{" "}
                              {classItem.description ||
                                "No description available"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className=" mt-3">
                        <strong>Total Classes:</strong>{" "}
                        {program.numberOfClasses || "Not specified"}
                        <br />
                        <strong>Classes per week:</strong>{" "}
                        {program.classesPerWeek || "Not specified"}
                        <br />
                        <strong>Duration:</strong> {program.durationNumber}{" "}
                        {program.durationUnit}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Sessions */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection("sessions")}
                >
                  <h4 className="text-lg font-semibold mb-0">Sessions</h4>
                  {openSections.sessions ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.sessions && (
                  <div className="row mt-3">
                    {program.sessions && program.sessions.length > 0 ? (
                      program.sessions.map((session, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="border rounded p-3 h-100">
                            <h5 className="fw-bold">
                              {session.name || `Session ${index + 1}`}
                            </h5>
                            <p className="mb-1">
                              <strong>Date:</strong> {formatDate(session.date)}
                            </p>
                            <p className="mb-1">
                              <strong>Time:</strong>{" "}
                              {session.time || program.timings}
                            </p>
                            <p className="mb-1">
                              <strong>Duration:</strong>{" "}
                              {session.duration || program.sessionUnit}
                            </p>
                            <p className="mb-1">
                              <strong>Capacity:</strong>{" "}
                              {session.capacity || "Not specified"} participants
                            </p>
                            <p className="mb-1">
                              <strong>Available Spots:</strong>{" "}
                              {session.availableSpots ||
                                session.capacity ||
                                "Not specified"}
                            </p>
                            {session.notes && (
                              <p className="text-muted small">
                                {session.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className=" mt-3">
                        <strong>Session Unit:</strong>{" "}
                        {program.sessionUnit || "Not specified"}
                        <br />
                        <strong>Sessions per week:</strong>{" "}
                        {program.sessionsPerWeek || "Not specified"}
                        <br />
                        <strong>Schedule:</strong>{" "}
                        {program.timings || "Timing not specified"}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Location */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection("location")}
                >
                  <h4 className="text-lg font-semibold mb-0">
                    Location Details
                  </h4>
                  {openSections.location ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.location && (
                  <div className="mt-3">
                    <h5 className="fw-bold">
                      {program.locationName || "Primary Location"}
                    </h5>
                    <p className="text-muted">
                      <MdOutlineLocationOn className="me-2" />
                      {program.location || "Location not specified"}
                    </p>
                    {program.locationDetails?.facilities && (
                      <>
                        <h6 className="fw-semibold mt-3">
                          Facilities Available:
                        </h6>
                        <ul>
                          {program.locationDetails.facilities.map(
                            (facility, index) => (
                              <li key={index}>{facility}</li>
                            )
                          )}
                        </ul>
                      </>
                    )}
                    {program.locationNotes && (
                      <>
                        <h6 className="fw-semibold mt-3">
                          Additional Information:
                        </h6>
                        <p>{program.locationNotes}</p>
                      </>
                    )}
                    {program.locationMap && (
                      <div className="ratio ratio-16x9 mt-3">
                        <iframe
                          src={program.locationMap}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title="Location Map"
                        ></iframe>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Coaches */}
              <section className="border rounded-4 p-3 mb-2">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => toggleSection("coaches")}
                >
                  <h4 className="text-lg font-semibold mb-0">Our Coaches</h4>
                  {openSections.coaches ? <FaMinus /> : <FaPlus />}
                </div>
                {openSections.coaches && (
                  <div className="row mt-3">
                    {coaches && coaches.length > 0 ? (
                      coaches.map((coach, index) => (
                        <div
                          key={index}
                          className="col-md-4 col-sm-6 mb-4 text-center"
                        >
                          <img
                            src={coach.coachImage || "/images/kiraOne.png"}
                            alt={coach.coachName}
                            className="rounded-circle mb-3"
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                          <h5 className="fw-bold">{coach.coachName}</h5>
                          {coach.coachDescription && (
                            <p className="text-muted small">
                              {coach.coachDescription}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center">
                        <p className="text-muted">
                          Our experienced coaching team will be assigned based
                          on your program level and availability.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Additional Information */}
              {/* <section className="border rounded-4 p-3 mb-2">
                <h4 className="text-lg font-semibold mb-3">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="list-unstyled">
                    <li><strong>Email Notifications:</strong> {program.triggerEmail ? 'Enabled' : 'Disabled'}</li>
                    <li><strong>Show Promo Dropdown:</strong> {program.showPromoDropdown ? 'Yes' : 'No'}</li>
                  </ul>
                  <ul className="list-unstyled">
                    <li><strong>Created:</strong> {formatDate(program.createdAt?.toDate?.())}</li>
                    <li><strong>Last Updated:</strong> {formatDate(program.updatedAt?.toDate?.())}</li>
                  </ul>
                </div>
              </section> */}
            </div>

            {/* Right Sidebar */}
            <div className="col-lg-4">
              <div
                className="border rounded-4 p-4 sticky-top"
                style={{ top: "100px" }}
              >
                <h4 className="fw-bold mb-3">Ready to Start?</h4>
                <p className="text-muted mb-4">
                  Join {program.programName} and take your game to the next
                  level!
                </p>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Price:</span>
                    <span className="fw-bold">${program.price}</span>
                  </div>
                  {program.enablePromoCode && (
                    <div className="text-success small">
                      <strong>Promo Code:</strong> {program.discountPromoCode}
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-warning w-100 rounded-4 btn-md text-decoration-none px-4 py-2 fw-bold"
                  onClick={() => handleRegisterClick(program)}
                >
                  Register Now
                </button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Have questions?{" "}
                    <Link to="/" className="text-warning">
                      Contact us
                    </Link>
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
  );
}

export default ProgramDetail;
