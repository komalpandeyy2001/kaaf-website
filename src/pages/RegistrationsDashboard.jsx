import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "./Firebase/firebase";
import { auth } from "./Firebase/firebase";
import "./RegistrationsDashboard.css";
import { FaRegClock } from "react-icons/fa6";
import { MdOutlineLocationOn } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";

const RegistrationsDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classRegistrations, setClassRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      let userId = auth.currentUser?.uid;

      if (!userId) {
        const stored = localStorage.getItem("userInfo");
        if (stored) {
          const parsed = JSON.parse(stored);
          userId = parsed?.uid;
        }
      }

      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch all user registrations
      const [
        registrationsSnapshot,
        eventRegistrationsSnapshot,
        programRegistrationsSnapshot,
        classRegistrationsSnapshot,
      ] = await Promise.all([
        getDocs(
          query(collection(db, "registrations"), where("userId", "==", userId))
        ),
        getDocs(
          query(
            collection(db, "eventRegistrations"),
            where("userId", "==", userId)
          )
        ),
        getDocs(
          query(
            collection(db, "programRegistrations"),
            where("userId", "==", userId)
          )
        ),
        getDocs(
          query(
            collection(db, "classRegistrations"),
            where("userId", "==", userId)
          )
        ),
      ]);

      const registrationsData = registrationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRegistrations(registrationsData);

      const eventRegistrationsData = eventRegistrationsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() })
      );
      const programRegistrationsData = programRegistrationsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() })
      );
      const classRegistrationsData = classRegistrationsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() })
      );
      setClassRegistrations(classRegistrationsData);

      // ✅ Programs: fetch doc for each registration (no deduplication!)
      const programPromises = programRegistrationsData.map(async (reg) => {
        const docSnap = await getDoc(doc(db, "programs", reg.programId));
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data(),
            paymentStatus: reg.paymentStatus,
            registrationId: reg.id,
            registeredOn: reg.createdAt,
            price: reg.price ?? docSnap.data().price,
          };
        }
        return null;
      });

      // ✅ Events: fetch doc for each registration (no deduplication!)
      const eventPromises = eventRegistrationsData.map(async (reg) => {
        const docSnap = await getDoc(doc(db, "events", reg.eventId));
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data(),
            paymentStatus: reg.paymentStatus,
            registrationId: reg.id,
            registeredOn: reg.createdAt,
            price: reg.price ?? docSnap.data().price,
          };
        }
        return null;
      });

      const [registeredPrograms, registeredEvents] = await Promise.all([
        Promise.all(programPromises).then((list) => list.filter(Boolean)),
        Promise.all(eventPromises).then((list) => list.filter(Boolean)),
      ]);

      setPrograms(registeredPrograms);
      setEvents(registeredEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "active":
      case "confirmed":
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "primary";
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const renderRegistrationCard = (registration) => (
    <div
      key={registration.id}
      className="col-9 col-sm-6 col-md-5 col-lg-5 col-xl-3"
    >
      <div className="rounded-4 shadow h-100">
        <img
          src={registration.imageUrl || "/images/kiraOne.png"}
          alt={
            registration.eventName || registration.programName || "Registration"
          }
          className="img-fluid mb-3 p-0 rounded-top"
          style={{ maxHeight: "220px", width: "100%", objectFit: "cover" }}
        />
        <div className="px-4 pb-4">
          <div className="fs-5 text-start fw-semibold">
            {registration.eventName ||
              registration.programName ||
              "Registration"}
          </div>
          <div className="items-start ps-3 pt-2 fs-6 fw-semibold text-gray">
            <MdOutlineLocationOn className="me-2 fs-5 text-dark" />{" "}
            {registration.location || "Location not specified"}
          </div>
          <div className="items-start ps-3 fs-6 fw-semibold text-gray">
            <FaRegClock className="text-dark me-2 fs-5 ps-1" />{" "}
            {registration.time || "Timing not specified"}
          </div>
          <div className="fs-6 fw-semibold mt-3">
            {stripHtml(registration.shortDescription || "")}
          </div>
          <div className="fs-6 fw-semibold mt-3">
            <div
              dangerouslySetInnerHTML={{
                __html: registration.description || "",
              }}
            />
          </div>

          {/* <div className="d-flex justify-content-between align-items-center mt-3">
            <Link
              to={`/program/${registration.id}`}
              className="btn btn-outline-warning rounded-3 btn-md fs-6 px-3 py-2 text-decoration-none"
            >
              View Details
            </Link>

            <Link
              to="/registration"
              state={{
                programId: registration.id,
                programName: registration.programName || registration.eventName,
                price: registration.price,
                source: "programs",
              }}
              className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
            >
              Register Now <IoIosArrowForward />
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );

  const renderEventCard = (event) => (
    <div key={event.id} className="col-9 col-sm-6 col-md-5 col-lg-5 col-xl-3">
      <div className="rounded-4 shadow h-100">
        <img
          src={event.imageUrl || "/images/kiraOne.png"}
          alt={event.title || event.eventName || event.name || "Event"}
          className="img-fluid mb-3 p-0 rounded-top"
          style={{ maxHeight: "220px", width: "100%", objectFit: "cover" }}
        />
        <div className="px-4 pb-4">
          <div className="fs-5 text-start fw-semibold">
            {event.title || event.eventName || event.name || "Event"}
          </div>
          <div className="items-start ps-3 pt-2 fs-6 fw-semibold text-gray">
            <MdOutlineLocationOn className="me-2 fs-5 text-dark" />{" "}
            {event.location || "Location not specified"}
          </div>
          <div className="items-start ps-3 fs-6 fw-semibold text-gray">
            <FaRegClock className="text-dark me-2 fs-5 ps-1" />{" "}
            {event.time ||
              event.schedule ||
              event.timings ||
              "Timing not specified"}
          </div>

          <div className="fs-6 fw-semibold mt-3">
            {stripHtml(event.shortDescription || "")}
          </div>
          <div className="fs-6 fw-semibold mt-3">
            <div
              dangerouslySetInnerHTML={{ __html: event.description || "" }}
            />
          </div>
          <div className="flex justify-content-between align-items-center">
            {/* ✅ Status for Event */}
            <div className="fs-6 fw-semibold mt-3">
              Status:{" "}
              <span className={`text-${getStatusColor(event.paymentStatus)}`}>
                {event.paymentStatus || "Unknown"}
              </span>
            </div>

            {/* {event.paymentStatus?.toLowerCase() === "pending" && (
              <div className="mt-3">
                <Link
                  to="/payment"
                  state={{
                    type: "event",
                    registrationId: event.registrationId,
                    eventId: event.id,
                    eventName: event.title || event.eventName || event.name,
                    price: event.price,
                  }}
                  className="btn btn-success w-100"
                >
                  Pay Now
                </Link>
              </div>
            )} */}
          </div>

          {/* <div className="d-flex justify-content-between align-items-center mt-3">
            <Link
              to={`/event/${event.id}`}
              className="btn btn-outline-warning rounded-3 btn-md fs-6 px-3 py-2 text-decoration-none"
            >
              View Details
            </Link>
            <Link
              to="/registration"
              state={{
                eventId: event.id,
                eventName: event.title || event.eventName || event.name,
                price: event.price,
                source: "events",
              }}
              className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
            >
              Register Now <IoIosArrowForward />
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );

  const renderProgramCard = (program) => (
    <div key={program.id} className="col-9 col-sm-6 col-md-5 col-lg-5 col-xl-3">
      <div className="rounded-4 shadow h-100">
        <img
          src={program.imageUrl || "/images/kiraOne.png"}
          alt={program.programName || program.name || "Program"}
          className="img-fluid mb-3 p-0 rounded-top"
          style={{ maxHeight: "220px", width: "100%", objectFit: "cover" }}
        />
        <div className="px-4 pb-4">
          <div className="fs-5 text-start fw-semibold">
            {program.programName || program.name || "Program"}
          </div>
          <div className="items-start ps-3 pt-2 fs-6 fw-semibold text-gray">
            <MdOutlineLocationOn className="me-2 fs-5 text-dark" />{" "}
            {program.location || "Location not specified"}
          </div>
          <div className="items-start ps-3 fs-6 fw-semibold text-gray">
            <FaRegClock className="text-dark me-2 fs-5 ps-1" />{" "}
            {program.duration || program.timings || "Flexible duration"}
          </div>
          <div className="fs-6 fw-semibold mt-3">
            {stripHtml(program.shortDescription || "")}
          </div>
          <div className="fs-6 fw-semibold mt-3">
            <div
              dangerouslySetInnerHTML={{ __html: program.description || "" }}
            />
          </div>
          <div className="flex justify-content-between align-items-center">
            {/* ✅ Add Status line */}
            <div className="fs-6 fw-semibold mt-3">
              Status:{" "}
              <span className={`text-${getStatusColor(program.paymentStatus)}`}>
                {program.paymentStatus || "Unknown"}
              </span>
            </div>

            {/* {program.paymentStatus?.toLowerCase() === "pending" && (
              <div className="mt-3">
                <Link
                  to="/payment"
                  state={{
                    type: "program",
                    registrationId: program.registrationId,
                    programId: program.id,
                    programName: program.programName || program.name,
                    price: program.price,
                  }}
                  className="btn btn-success w-100"
                >
                  Pay Now
                </Link>
              </div>
            )} */}
          </div>

          {/* <div className="d-flex justify-content-between align-items-center mt-3">
            <Link
              to={`/program/${program.id}`}
              className="btn btn-outline-warning rounded-3 btn-md fs-6 px-3 py-2 text-decoration-none"
            >
              View Details
            </Link>

            <Link
              to="/registration"
              state={{
                programId: program.id,
                programName: program.programName || program.name,
                price: program.price,
                source: "programs",
              }}
              className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
            >
              Register Now <IoIosArrowForward />
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );

  const renderClassCard = (classRegistration) => {
    return (
      <div
        key={classRegistration.id}
        className="col-9 col-sm-6 col-md-5 col-lg-5 col-xl-3"
      >
        <div className="rounded-4 shadow h-100">
          <img
            src={classRegistration.imageUrl || "/images/kiraOne.png"}
            alt={classRegistration.name || "Class Registration"}
            className="img-fluid mb-3 p-0 rounded-top"
            style={{ maxHeight: "220px", width: "100%", objectFit: "cover" }}
          />
          <div className="px-4 pb-4">
            <div className="fs-5 text-start fw-semibold">
              {"Class Registration"}
            </div>
            <div className="items-start ps-3 pt-2 fs-6 fw-semibold text-gray">
              <MdOutlineLocationOn className="me-2 fs-5 text-dark" />{" "}
              {classRegistration.facilityName || "Location not specified"}
            </div>
            <div className="items-start ps-3 fs-6 fw-semibold text-gray">
              <FaRegClock className="text-dark me-2 fs-5 ps-1" />{" "}
              {classRegistration.timeSlot || "Timing not specified"}
            </div>
            <div className="fs-6 fw-semibold mt-3">
              Date: {formatDate(classRegistration.date)}
            </div>
            <div className="fs-6 fw-semibold mt-3">
              Guests: {classRegistration.guests || 1}
            </div>
            <div className="fs-6 fw-semibold mt-3">
              Duration: {classRegistration.duration || "Not specified"}
            </div>
            <div className="flex justify-content-between align-items-center">
              <div className="fs-6 fw-semibold mt-3">
                Status:{" "}
                <span
                  className={`text-${getStatusColor(
                    classRegistration.paymentStatus
                  )}`}
                >
                  {classRegistration.paymentStatus || "Unknown"}
                </span>
              </div>

              {/* {classRegistration.paymentStatus?.toLowerCase() === "pending" && (
                <div className="mt-3">
                  <Link
                    to="/payment"
                    state={{
                      type: "class",
                      registrationId: classRegistration.id,
                      classId: classRegistration.classId, // adjust field if different
                      className: classRegistration.name,
                      price: classRegistration.price,
                    }}
                    className="btn btn-success w-100"
                  >
                    Pay Now
                  </Link>
                </div>
              )} */}
            </div>
            {/* <div className="d-flex justify-content-between align-items-center mt-3">
              <Link
                to={`/class/${classRegistration.id}`}
                className="btn btn-outline-warning rounded-3 btn-md fs-6 px-3 py-2 text-decoration-none"
              >
                View Details
              </Link>

              <Link
                to="/book-class"
                className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
              >
                Book Another <IoIosArrowForward />
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your registrations...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid py-4">
        <div className="mt-5 pt-5"></div>
        <div className="row">
          <div className="col-12">
            <div className="mb-4">
              <div className="compact-heading">
                <h1 className="compact-title">My Registrations Dashboard</h1>
                <p className="compact-subtitle">
                  Manage all your events, programs, and registrations in one
                  place
                </p>
              </div>
            </div>

            <div className="interactive-tabs-container mb-4">
              <div className="d-flex flex-wrap justify-content-center">
                <button
                  className={`interactive-tab ${
                    activeTab === "all" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("all");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  All
                  <span className="tab-badge">
                    {registrations.length +
                      events.length +
                      programs.length +
                      classRegistrations.length}
                  </span>
                </button>

                {/* <button
                  className={`interactive-tab ${
                    activeTab === "registrations" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("registrations");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  My Registrations
                  <span className="tab-badge">{registrations.length}</span>
                </button> */}

                <button
                  className={`interactive-tab ${
                    activeTab === "events" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("events");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Events
                  <span className="tab-badge">{events.length}</span>
                </button>

                <button
                  className={`interactive-tab ${
                    activeTab === "programs" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("programs");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Programs
                  <span className="tab-badge">{programs.length}</span>
                </button>

                <button
                  className={`interactive-tab ${
                    activeTab === "classes" ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab("classes");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Classes
                  <span className="tab-badge">{classRegistrations.length}</span>
                </button>
              </div>
            </div>

            <div className="row justify-content-center align-items-start g-4">
              {activeTab === "all" && (
                <>
                  {registrations.map(renderRegistrationCard)}
                  {events.map(renderEventCard)}
                  {programs.map(renderProgramCard)}
                  {classRegistrations.map(renderClassCard)}
                </>
              )}
              {activeTab === "registrations" &&
                registrations.map(renderRegistrationCard)}
              {activeTab === "events" && events.map(renderEventCard)}
              {activeTab === "programs" && programs.map(renderProgramCard)}
              {activeTab === "classes" &&
                classRegistrations.map(renderClassCard)}

              {activeTab === "all" &&
                registrations.length === 0 &&
                events.length === 0 &&
                programs.length === 0 &&
                classRegistrations.length === 0 && (
                  <div className="col-12 text-center py-5">
                    <div className="alert alert-info" role="alert">
                      <h4 className="alert-heading">No Registrations Found</h4>
                      <p>
                        You haven't registered for any programs, events, or
                        classes yet.
                      </p>
                      <hr />
                      <a href="/programs" className="btn btn-primary me-2">
                        Browse Programs
                      </a>
                      <a href="/events" className="btn btn-secondary me-2">
                        View Events
                      </a>
                      <a href="/book-class" className="btn btn-info">
                        Book a Class
                      </a>
                    </div>
                  </div>
                )}
              {activeTab === "classes" && classRegistrations.length === 0 && (
                <div className="col-12 text-center py-5">
                  <div className="alert alert-info" role="alert">
                    <h4 className="alert-heading">
                      No Class Registrations Found
                    </h4>
                    <p>You haven't registered for any classes yet.</p>
                    <hr />
                    <a href="/book-class" className="btn btn-info">
                      Book a Class
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationsDashboard;
