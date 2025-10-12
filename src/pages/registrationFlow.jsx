import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import StayGame from "../../Components/StayGame";
import { addDocument } from "./Firebase/CloudFirestore/SetData";
import { auth } from "./Firebase/firebase";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isUserLoggedIn } from "../utils/authState";
import { serverTimestamp } from "firebase/firestore";

const RegistrationFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programName, programId, price, source, eventData, eventId, eventName } =
    location.state || {};

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    emergencyName: "",
    emergencyPhone: "",
    medicalInfo: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("Registration Data:", location.state);
    console.log("Program Name:", programName);
    console.log("Program ID:", programId);
    console.log("Event Name:", eventName);
    console.log("Event ID:", eventId);
    console.log("Source:", source);
  }, [location.state, programName, programId, eventName, eventId, source]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "phone" || id === "emergencyPhone") {
      const onlyNumbers = value.replace(/\D/g, ""); // remove non-digit characters
      setFormData((prev) => ({ ...prev, [id]: onlyNumbers }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }

    // Remove error when user types
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateFields = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    // if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (!formData.dob) newErrors.dob = "Date of Birth is required";

    if (!formData.emergencyName.trim())
      newErrors.emergencyName = "Emergency contact name is required";
    if (!formData.emergencyPhone.trim())
      newErrors.emergencyPhone = "Emergency contact phone is required";

    return newErrors;
  };

  const handleRegistration = async () => {
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        navigate("/signup?redirect=/registration");
        return;
      }

      // Determine if this is an event or program registration
      const isEventRegistration = source === "events" || eventId;
      
      const validatedData = {
        programName: isEventRegistration 
          ? eventName || eventData?.eventName || eventData?.name || "Unnamed Event"
          : programName || "Unnamed Program",
        programId: isEventRegistration 
          ? eventId || eventData?.eventId || eventData?.id || "unknown"
          : programId || "unknown",
        price: price || eventData?.price || 0,
        source: source || (isEventRegistration ? "events" : "programs"),
      };

      const registrationData = {
        ...(isEventRegistration
          ? {
              eventId: validatedData.programId,
              eventName: validatedData.programName,
            }
          : {
              programId: validatedData.programId,
              programName: validatedData.programName,
            }),
        price: validatedData.price,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dateofbirth: formData.dob || "",
        emergencyContactName: formData.emergencyName.trim(),
        emergencyContactPhone: formData.emergencyPhone.trim(),
        medicalinformation: formData.medicalInfo.trim(),
        userId: user.uid,
       registrationDate: serverTimestamp(),  // ✅ Firestore timestamp
  updatedAt: serverTimestamp(),       
        paymentStatus: "pending",
      };

      const collectionName = isEventRegistration
        ? "eventRegistrations"
        : "programRegistrations";
      const docRef = await addDocument(collectionName, registrationData);

      const params = new URLSearchParams();
      params.append("registrationId", docRef.id);
      params.append("type", isEventRegistration ? "event" : "program");
      if (!isEventRegistration)
        params.append("programId", validatedData.programId);
      else params.append("eventId", validatedData.programId);

      window.location.href = `/payment?${params.toString()}`;
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="mt-5 pt-5"></div>
      <div className="mt-5 "></div>
      <section className="mb-5">
        <div className="container border border-1 shadow rounded-4 p-4">
          <h2 className="fw-bold mb-1">Registration Details</h2>
          <div className="mb-4">
            <div className="fw-semibold">
              {source === "events" ? "Event" : "Program"} - <span className="fw-semibold">
                {source === "events" ? eventName : programName}
              </span>
            </div>
            <div className="fw-semibold">
              Price - <span className="fw-semibold">${price}</span>
            </div>
          </div>

          {/* Personal Information */}
          <h5 className="fw-semibold mb-3">Personal Information</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">
                First Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control bg-light ${
                  errors.firstName ? "is-invalid" : ""
                }`}
                id="firstName"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              {errors.firstName && (
                <div className="invalid-feedback">{errors.firstName}</div>
              )}
            </div>
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className={`form-control bg-light `}
                id="lastName"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="row g-3 mb-3">
            {/* Email Field */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control bg-light ${
                  errors.email ? "is-invalid" : ""
                }`}
                id="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => {
                  // Email validation on blur
                  if (!formData.email.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Email is required",
                    }));
                  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Invalid email format",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">
                Phone Number<span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                className={`form-control bg-light ${
                  errors.phone ? "is-invalid" : ""
                }`}
                id="phone"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={handleInputChange}
              />
              {errors.phone && (
                <div className="invalid-feedback">{errors.phone}</div>
              )}
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <label htmlFor="dob" className="form-label">
              Date of Birth<span className="text-danger">*</span>
            </label>
            <Flatpickr
              id="dob"
              placeholder="Select Date of Birth"
              className={`form-control bg-light ${
                errors.dob ? "is-invalid" : ""
              }`}
              options={{
                dateFormat: "m/d/Y",
              }}
              value={formData.dob}
              onChange={([date]) => {
                setFormData((prev) => ({ ...prev, dob: date }));

                // Clear DOB error immediately after selection
                if (errors.dob) {
                  setErrors((prev) => ({ ...prev, dob: "" }));
                }
              }}
            />

            {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
          </div>

          {/* Emergency Contact */}
          <h5 className="fw-semibold mb-3">Emergency Contact</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="emergencyName" className="form-label">
                Emergency Contact Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control bg-light ${
                  errors.emergencyName ? "is-invalid" : ""
                }`}
                id="emergencyName"
                placeholder="Enter Emergency Contact Name"
                value={formData.emergencyName}
                onChange={handleInputChange}
              />
              {errors.emergencyName && (
                <div className="invalid-feedback">{errors.emergencyName}</div>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div className="col-md-6">
              <label htmlFor="emergencyPhone" className="form-label">
                Emergency Contact Phone<span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                className={`form-control bg-light ${
                  errors.emergencyPhone ? "is-invalid" : ""
                }`}
                id="emergencyPhone"
                placeholder="Enter emergency phone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
              />
              {errors.emergencyPhone && (
                <div className="invalid-feedback">{errors.emergencyPhone}</div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <h5 className="fw-semibold mb-3">Medical Information</h5>
          <div className="mb-4">
            <label htmlFor="medicalInfo" className="form-label">
              Medical Conditions or Allergies
            </label>
            <textarea
              className="form-control bg-light"
              id="medicalInfo"
              rows="3"
              placeholder="Please list any medical conditions, allergies or physical limitations we should be aware of"
              value={formData.medicalInfo}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <button
            className="btn btn-custom-yellow w-100 fw-bold py-2"
            onClick={handleRegistration}
          >
            Continue to Payment &nbsp; <span>&#8594;</span>
          </button>
        </div>
      </section>

      <StayGame />

      <Footer />
    </div>
  );
};

export default RegistrationFlow;