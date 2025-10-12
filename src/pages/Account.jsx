import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaHeart, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';

const Account = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="container-fluid py-5 bg-light">
         <div className="mt-5"></div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-yellow text-center">
              <h2 className="mb-0 text-dark">My Account</h2>
            </div>
            <div className="card-body">
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
                <button onClick={handleLogout} className="list-group-item list-group-item-action d-flex align-items-center text-danger">
                  <FaSignOutAlt className="me-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
