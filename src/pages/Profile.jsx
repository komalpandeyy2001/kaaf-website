import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db, auth } from './Firebase/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc } from 'firebase/firestore';
import { ForgotPassword } from './Firebase/FirebaseAuth/UserForgotPassword';
const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem('userInfo');
return storedUser ? JSON.parse(storedUser) : {
  displayName: '',   
  email: '',
  phone: '',
  address: '',
  bio: ''
};

  });

  const [formData, setFormData] = useState({ ...userData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [registrationCounts, setRegistrationCounts] = useState({
    total: 0,
    events: 0,
    programs: 0
  });

  // Update the formData state when userData changes
  useEffect(() => {
    setFormData({ ...userData });
  }, [userData]);

  // Fetch registration counts when component mounts
  useEffect(() => {
    const fetchRegistrationCounts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No user logged in');
          return;
        }

        const userId = user.uid;

        // Fetch counts from different registration collections
        const [
          registrationsSnapshot,
          eventRegistrationsSnapshot,
          programRegistrationsSnapshot
        ] = await Promise.all([
          getDocs(query(collection(db, 'registrations'), where('userId', '==', userId))),
          getDocs(query(collection(db, 'eventRegistrations'), where('userId', '==', userId))),
          getDocs(query(collection(db, 'programRegistrations'), where('userId', '==', userId)))
        ]);

        const registrationsCount = registrationsSnapshot.size;
        const eventsCount = eventRegistrationsSnapshot.size;
        const programsCount = programRegistrationsSnapshot.size;

        setRegistrationCounts({
          total: registrationsCount + eventsCount + programsCount,
          events: eventsCount,
          programs: programsCount
        });
      } catch (error) {
        console.error('Error fetching registration counts:', error);
      }
    };

    fetchRegistrationCounts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

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

        // ✅ keep localStorage in sync
        localStorage.setItem("userInfo", JSON.stringify(userDataFromDB));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchUserData();
}, []);

const handleSavePersonalInfo = async (e) => {
  e.preventDefault();
  try {
    const user = auth.currentUser;
    if (!user) {
      toast.error("No authenticated user found!");
      return;
    }

    const updatedUserData = { ...formData };

    // ✅ Save to Firestore (merge so we don’t overwrite existing fields)
    await setDoc(doc(db, "users", user.uid), updatedUserData, { merge: true });

    // ✅ Update local state + localStorage
    setUserData(updatedUserData);
    localStorage.setItem("userInfo", JSON.stringify(updatedUserData));

    toast.success("Personal information updated successfully!");
  } catch (error) {
    console.error("Error saving personal info:", error);
    toast.error("Failed to save personal information!");
  }
};


  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    // Validate password strength (optional)
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long!');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('No authenticated user found!');
        return;
      }

      // Fetch current password from users collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        toast.error('User data not found!');
        return;
      }

      const storedPassword = userDocSnap.data().password;

      // Check if current password matches stored password
      if (passwordData.currentPassword !== storedPassword) {
        toast.error('Current password is incorrect!');
        return;
      }

      // Call the Firebase function to change password
      await ForgotPassword(passwordData.currentPassword, passwordData.newPassword);

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);

      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/wrong-password':
          toast.error('Current password is incorrect!');
          break;
        case 'auth/weak-password':
          toast.error('New password is too weak!');
          break;
        case 'auth/requires-recent-login':
          toast.error('Please log in again to change your password!');
          break;
        default:
          toast.error('Failed to change password. Please try again.');
      }
    }
  };

  const renderPersonalInfoTab = () => (
    <div className="p-4">
      <h2 className="mb-4">Personal Information</h2>
      <form onSubmit={handleSavePersonalInfo} className="row g-3">

       <div className="col-md-6">
  <label htmlFor="displayName" className="form-label">Full Name</label>
  <input
    type="text"
    className="form-control"
    id="displayName"
    name="displayName" 
    value={formData.displayName} 
    onChange={handleInputChange}
    placeholder="Enter your full name"
  />
</div>
        <div className="col-md-6">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            disabled
            onChange={handleInputChange}
            placeholder="Enter your email address"
          />
        </div>

<div className="col-md-6">
  <label htmlFor="phone" className="form-label">Phone Number</label>
  <input
    type="tel"
    className="form-control"
    id="phone"
    name="phone"
    value={formData.phone}
    onChange={(e) => {
      // keep only digits
      const digitsOnly = e.target.value.replace(/\D/g, "");
      setFormData({ ...formData, phone: digitsOnly });
    }}
    placeholder="Enter your phone number"
    inputMode="numeric"   // shows numeric keypad on mobile
    pattern="[0-9]*"      // ensures only digits
  />
</div>




        <div className="col-12">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea
            className="form-control"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter your address"
            rows="3"
          />
        </div>

        <div className="col-12">
          <label htmlFor="bio" className="form-label">Bio</label>
          <textarea
            className="form-control"
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
            rows="4"
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn-custom-yellow">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  const renderPasswordTab = () => (
    <div className="p-4">
      <h2 className="mb-4">Change Password</h2>
      <form onSubmit={handleChangePassword} className="row g-3">
        <div className="col-md-6">
          <label htmlFor="currentPassword" className="form-label">Current Password</label>
          <input
            type="password"
            className="form-control"
            id="currentPassword"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter current password"
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            required
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn-custom-yellow">
            Change Password
          </button>
        </div>
      </form>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfoTab();
      case 'password':
        return renderPasswordTab();
      case 'orders':
        return (
          <div className="p-4">
            <h2 className="mb-4">Your Orders</h2>
            <p className="text-muted">Your order history will appear here.</p>
          </div>
        );
      case 'registrations':
        return (
          <div className="p-4">
            <h2 className="mb-4">Your Registrations</h2>
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="card border-0 bg-yellow text-center p-3">
                  <h3 className="text-dark">{registrationCounts.total}</h3>
                  <p className="mb-0 ">Total Registrations</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 bg-yellow text-center p-3">
                  <h3 className="text-dark">{registrationCounts.events}</h3>
                  <p className="mb-0">Events Registered</p>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 bg-yellow text-center p-3">
                  <h3 className="text-dark">{registrationCounts.programs}</h3>
                  <p className="mb-0">Programs Registered</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <a href="/registrations" className="btn-custom-yellow">
                View All Registrations
              </a>
            </div>
          </div>
        );
      default:
        return renderPersonalInfoTab();
    }
  };

  return (
    <div className="container-fluid py-4 ">
      <div className="row ">
        <div className="col-12">
          <h1 className="text-center mb-4">User Profile</h1>
        </div>
      </div>

      <div className="row justify-content-center ">
        {/* Left Side - Profile Image and Info */}
        <div className="col-md-3 mb-4">
          <div className="card bg-light rounded-4 shadow">
            <div className="card-body text-center">
              <div className="mb-3">
                <img
                  src="/images/user-avatar.png"
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiNlMWUxZTEiLz48cGF0aCBkPSJNNjAgMzBDNjcuNzMxNyAzMCA3NCAzNi4yNjgzIDc0IDQ0Qzc0IDUxLjczMTcgNjcuNzMxNyA1OCA2MCA1OEM1Mi4yNjgzIDU4IDQ2IDUxLjczMTcgNDYgNDRDNDYgMzYuMjY4MyA1Mi4yNjgzIDMwIDYwIDMwWk02MCA3MEM3Ni41NDkgNzAgOTAgODMuNDUxIDkwIDEwMEgzMEMzMCA4My40NTEgNDMuNDUxIDcwIDYwIDcwWiIgZmlsbD0iIzk5OTk5OSIvPjwvc3ZnPg==';
                  }}
                />
              </div>
              <button className="btn-custom-yellow  mb-3">
                Change Image
              </button>
<h5 className="card-title ">{userData.displayName}</h5>  
              <p className="card-text text-muted">{userData.email}</p>
       

              {/* Registration Stats */}
              <div className="mt-4 pt-3 border-top">
                <h6 className="text-center mb-3">Registration Summary</h6>
                <div className="d-flex justify-content-around">
                  <div className="text-center">
                    <div className="fw-bold text-primary fs-5">{registrationCounts.total}</div>
                    <div className="small text-muted">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold text-success fs-5">{registrationCounts.events}</div>
                    <div className="small text-muted">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold text-warning fs-5">{registrationCounts.programs}</div>
                    <div className="small text-muted">Programs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Tabs and Content */}
        <div className="col-md-7">
          <div className="card shadow bg-light">
            <div className="card-header bg-yellow text-white">
              <ul className="nav nav-tabs text-dark card-header-tabs">
                <li className="nav-item ">
                  <button
                    className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                  >
                    Personal Info
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    Password
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Orders
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'registrations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('registrations')}
                  >
                    Registrations
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
