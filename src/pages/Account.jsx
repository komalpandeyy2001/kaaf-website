import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaHeart, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import Footer from '../../Components/Footer';

const Account = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
<>
  
      <div className="main-content-wrapper">
       
      <div className="justify-content-center">
        <div className="">
          <div className="card border-0 ">
            <div className="card-header bg-yellow text-center py-3">
              <h2 className="mb-0 text-dark">My Account</h2>
            </div>
            <div className="card-body px-0">
              <div className="list-group list-group-flush">
                <Link to="/orders" className="list-group-item list-group-item-action d-flex align-items-center">
                  <FaShoppingCart className="me-3 text-primary" />
                  Order History
                </Link>
                <Link to="/wishlist" className="list-group-item list-group-item-action d-flex align-items-center">
                  <FaHeart className="me-3 text-danger" />
                  Wishlist
                </Link>
                <Link to="/profile" className="list-group-item list-group-item-action d-flex align-items-center">
                  <FaUser className="me-3 text-success" />
                  Edit Profile
                </Link>
                <Link to="/terms" className="list-group-item list-group-item-action d-flex align-items-center">
                  <FaFileAlt className="me-3 text-info" />
                  Terms and Policy
                </Link>
                <button onClick={handleLogout} className="bg-light list-group-item list-group-item-action d-flex align-items-center text-danger">
                  <FaSignOutAlt className="me-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Account;
