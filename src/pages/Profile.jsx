import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./Firebase/firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Profile = () => {
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem("userInfo");
    return storedUser
      ? JSON.parse(storedUser)
      : { displayName: "", email: "", phone: "", address: "" };
  });

  const [formData, setFormData] = useState({ ...userData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => setFormData({ ...userData }), [userData]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userDataFromDB = userDocSnap.data();
          setUserData(userDataFromDB);
          setFormData(userDataFromDB);
          localStorage.setItem("userInfo", JSON.stringify(userDataFromDB));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Separate handler for saving personal info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return toast.error("No authenticated user found!");

    try {
      await setDoc(doc(db, "users", user.uid), formData, { merge: true });
      setUserData(formData);
      localStorage.setItem("userInfo", JSON.stringify(formData));
      toast.success("Personal details updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update personal details!");
    }
  };

  // Separate handler for changing password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return toast.error("No authenticated user found!");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      return toast.error("Please fill all password fields!");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters!");
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);

      toast.success("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect!");
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Please log in again to change your password!");
      } else {
        toast.error("Failed to update password!");
      }
    }
  };

  return (
    <div className="container-fluid py-5 my-5 bg-light">
      {/* <h3 className="text-center ">User Profile</h3> */}

      <div className="justify-content-center">
        <div className="">
          <div className="card bg-light shadow rounded-4">
            <div className="card-header bg-yellow text-dark fw-bold">
              Edit Profile
            </div>
            <div className="card-body">
              {/* Profile Icon */}
              <div className="text-center mb-4">
                <img
                  src="/images/user-avatar.png"
                  alt="Profile"
                  className="rounded-circle mb-3"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNlMWUxZTEiLz48cGF0aCBkPSJNNjAgMzBDNjcuNzMxNyAzMCA3NCAzNi4yNjgzIDc0IDQ0Qzc0IDUxLjczMTcgNjcuNzMxNyA1OCA2MCA1OEM1Mi4yNjgzIDU4IDQ2IDUxLjczMTcgNDYgNDRDNDYgMzYuMjY4MyA1Mi4yNjgzIDMwIDYwIDMwWk02MCA3MEM3Ni41NDkgNzAgOTAgODMuNDUxIDkwIDEwMEgzMEMzMCA4My40NTEgNDMuNDUxIDcwIDYwIDcwWiIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg==";
                  }}
                />
                <h5>{userData.displayName || "User Name"}</h5>
                <p className="text-muted">{userData.email}</p>
              </div>

              {/* Personal Info Form */}
              <form onSubmit={handleSaveProfile} className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: digitsOnly });
                    }}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  ></textarea>
                </div>

                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-warning px-4">
                    Save Personal Info
                  </button>
                </div>
              </form>

              {/* Password Form */}
              <form onSubmit={handleChangePassword} className="row g-3">
                <div className="col-12 mt-2">
                  <h5 className="fw-semibold text-dark mb-2">Change Password</h5>
                  <hr className="mb-3" />
                </div>

                {[
                  { label: "Current Password", name: "currentPassword", key: "current" },
                  { label: "New Password", name: "newPassword", key: "new" },
                  { label: "Confirm New Password", name: "confirmPassword", key: "confirm" },
                ].map(({ label, name, key }) => (
                  <div className="col-md-4 position-relative" key={key}>
                    <label className="form-label">{label}</label>
                    <div className="input-group">
                      <input
                        type={showPassword[key] ? "text" : "password"}
                        className="form-control"
                        name={name}
                        value={passwordData[name]}
                        onChange={handlePasswordChange}
                        placeholder={label}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => togglePasswordVisibility(key)}
                      >
                        {showPassword[key] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="col-12 text-end mt-3">
                  <button type="submit" className="btn btn-danger px-4">
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
