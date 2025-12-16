import { useState, useEffect } from "react";
import { FiFacebook } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa6";
import { AiOutlineYoutube } from "react-icons/ai";
import { Link } from "react-router-dom";
import { getUserData } from "../src/utils/userData";
import { getDocumentData } from "../src/pages/Firebase/CloudFirestore/GetData";

function Footer() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch user and cart info
  const fetchUserAndCart = async () => {
    const userData = getUserData();
    if (userData && userData.uid) {
      setUser(userData);
      try {
        const userDoc = await getDocumentData("users", userData.uid);
        const cart = userDoc?.carts || [];
        const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalCount);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartCount(0);
      }
    } else {
      setUser(null);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchUserAndCart();

    // Listen for cart updates and auth changes
    const handleCartUpdate = () => fetchUserAndCart();
    const handleAuthChange = () => fetchUserAndCart();

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <>
      {/* ================= DESKTOP FOOTER (≥768px) ================= */}
      <footer className=" d-none d-md-block ">
<div className="bg-dark text-white py-2">
          <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          {/* Logo */}
          <div className="mb-2 mb-md-0 logo">
            <img src="/logo.png" alt="Qaaf logo" />
          </div>

          {/* Contact Info */}
          <div className="mb-2 mb-md-0 text-center text-md-start">
            <span className="me-2">📧 qaaf@gmail.com</span> | 
            <span className="mx-2">📞 +91 12345 67890</span>
          </div>
          <div><a href="/terms" className="text-decoration-none text-white">Terms and Policy</a></div>

          {/* Social Icons */}
          <div className="d-flex gap-2 fs-5">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white">
              <FiFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white">
              <AiOutlineYoutube />
            </a>
          </div>
        </div>

        <div className="text-center mt-1 fs-6" style={{ fontSize: "0.75rem" }}>
          &copy; {new Date().getFullYear()} Qaaf | All Rights Reserved
        </div>
</div>
      </footer>

      {/* ================= MOBILE BOTTOM NAVIGATION (≤767px) ================= */}
      <div 
        className="d-md-none bg-white text-yellow position-fixed bottom-0 start-0 end-0 py-2 border-top"
        style={{ zIndex: 999 }}
      >
        <div className="d-flex justify-content-around text-center">

          <Link to="/" className="text-yellow text-decoration-none">
            <i className="bi bi-house-door-fill fs-5"></i>
            <div style={{ fontSize: "0.7rem" }}>Home</div>
          </Link>

          <Link to="/orders" className="text-yellow text-decoration-none">
            <i className="bi bi-grid-fill fs-5"></i>
            <div style={{ fontSize: "0.7rem" }}>Orders</div>
          </Link>

          {/* <Link to="/cart" className="text-yellow text-decoration-none position-relative">
            <i className="bi bi-cart-fill fs-5"></i>
            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
            <div style={{ fontSize: "0.7rem" }}>Cart</div>
          </Link> */}
          

          {user ? (
            <Link to="/account" className="text-yellow text-decoration-none">
              <i className="bi bi-person-fill fs-5"></i>
              <div style={{ fontSize: "0.7rem" }}>Account</div>
            </Link>
          ) : (
            <Link to="/login" className="text-yellow text-decoration-none">
              <i className="bi bi-box-arrow-in-right fs-5"></i>
              <div style={{ fontSize: "0.7rem" }}>Login</div>
            </Link>
          )}

        </div>
      </div>
    </>
  );
}

export default Footer;
