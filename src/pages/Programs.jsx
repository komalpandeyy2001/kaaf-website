import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegClock } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { MdOutlineLocationOn } from "react-icons/md";
import Footer from "../../Components/Footer";
import StayGame from "../../Components/StayGame";
import { getCollectionData } from "./Firebase/CloudFirestore/GetData";
import { isUserLoggedIn } from "../utils/authState";
import { toast } from "react-toastify";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [visiblePrograms, setVisiblePrograms] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programList = await getCollectionData("programs");
        setPrograms(programList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs. Please try again later.");
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };
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
      toast.success("Please sign up to register for programs.");

      const params = new URLSearchParams({
        redirect: "/registration",
        programId: program.id,
        programName: program.programName,
        price: program.price,
      });

      navigate(`/login?${params.toString()}`);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading programs...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <>
      <div className="mt-5 "></div>

      {/* first section */}
      <section>
        <div className="cta">
          <div className="container text-center text-white">
            <div className="text-yellow fw-bold display-3">Programs</div>
            <div className="fs-4 fw-semibold text-white">
              Discover the perfect program to elevate your game and achieve your
              goals.
            </div>
          </div>
        </div>
      </section>
      {/* cards */}
      <section className="my-5  pb-5">
        <div className="container ">
          <div className="row justify-content-center align-items-start g-4">
            {programs.length === 0 && (
              <div className="text-center fs-4">
                No programs available at the moment.
              </div>
            )}
            {programs.slice(0, visiblePrograms).map((program) => (
              <div
                key={program.id}
                className="col-12 col-md-6 col-lg-4 col-xl-5"
              >
                <div className="rounded-4 shadow h-100">
                  <img
                    src={program.imageUrl || "/images/kiraOne.png"}
                    alt={program.programName}
                    className="img-fluid mb-3 p-0 rounded-top"
                    style={{
                      maxHeight: "220px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="px-4 pb-4">
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="fs-5 fw-semibold">
                        {program.programName}
                      </div>
                      <div className="fs-5 fw-semibold">
                        ${program.price} per month
                      </div>
                    </div>
                    <div className="items-start ps-3 pt-2 fs-6 fw-semibold text-gray">
                      <MdOutlineLocationOn className="me-2 fs-5 text-dark" />{" "}
                      {program.location || "Location not specified"}
                    </div>
                    <div className="items-start ps-3 fs-6 fw-semibold text-gray">
                      <FaRegClock className="text-dark me-2 fs-5 ps-1" />{" "}
                      {program.timings || "Timing not specified"}
                    </div>
                    <div className="fs-6 fw-semibold mt-3">
                      {stripHtml(program.shortDescription || "")}
                    </div>
                    <div className="fs-6 fw-semibold mt-3">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: program.description || "",
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <Link
                        to={`/program/${program.id}`}
                        className="btn btn-outline-warning rounded-3 btn-md fs-6 px-3 py-2 text-decoration-none"
                      >
                        View Details
                      </Link>

                      <button
                        className="btn btn-custom-yellow btn-md fs-6 px-3 py-2 text-decoration-none"
                        onClick={() => handleRegisterClick(program)}
                      >
                        Register Now <IoIosArrowForward />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {programs.length > visiblePrograms && (
            <div className="text-center mt-4">
              <button
                onClick={() =>
                  setVisiblePrograms((prev) =>
                    Math.min(prev + 3, programs.length)
                  )
                }
                className="btn btn-custom-yellow btn-lg text-decoration-none"
              >
                More Programs
              </button>
            </div>
          )}
        </div>
      </section>

      <StayGame />

      <Footer />

      {/* Modal for all programs */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">All Programs</h5>
                {/* <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button> */}
              </div>
              <div className="modal-body">
                <div className="row justify-content-center align-items-start g-4">
                  {programs.map((program) => (
                    <div key={program.id} className="col-12 col-md-6 col-lg-6">
                      <div className="rounded-4 shadow h-100">
                        <img
                          src={program.imageUrl || "/images/kiraOne.png"}
                          alt={program.programName}
                          className="img-fluid mb-3 p-0 rounded-top"
                          style={{
                            maxHeight: "200px",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="px-4 pb-4">
                          <div className="fs-3 text-start fw-semibold">
                            {program.programName}
                          </div>
                          <div className="items-start ps-3 pt-3 fs-5 fw-semibold text-gray">
                            <MdOutlineLocationOn className="me-2 fs-3 text-dark" />{" "}
                            {program.location || "Location not specified"}
                          </div>
                          <div className="items-start ps-3 fs-5 fw-semibold text-gray">
                            <FaRegClock className="text-dark me-2 fs-3 ps-1" />{" "}
                            {program.timings || "Timing not specified"}
                          </div>
                          <div className="fs-5 fw-semibold mt-4">
                            {stripHtml(program.shortDescription || "")}
                          </div>
                          <div className="fs-5 fw-semibold mt-3">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: program.description || "",
                              }}
                            />
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="fs-4 fw-semibold">
                              {program.programName} - ${program.price} per month
                            </div>
                            <div className="d-flex gap-3">
                              <Link
                                to={`/program/${program.id}`}
                                className="btn btn-outline-warning btn-lg fs-5 px-4 py-2 text-decoration-none"
                                onClick={() => setShowModal(false)}
                              >
                                View Details
                              </Link>
                              <Link
                                to="/registration"
                                state={{
                                  programId: program.id,
                                  programName: program.programName,
                                  price: program.price,
                                  source: "programs",
                                }}
                                className="btn btn-custom-yellow btn-lg fs-5 px-4 py-2 text-decoration-none"
                                onClick={() => setShowModal(false)}
                              >
                                Register Now <IoIosArrowForward />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Programs;
