import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaUserCircle, FaHeart } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";
import { FiDownload } from "react-icons/fi";
import { RiMobileDownloadLine } from "react-icons/ri";
import { getUserData } from '../src/utils/userData'


import './Header.css';
import { getDocumentData } from '../src/pages/Firebase/CloudFirestore/GetData';

function Header() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to fetch cart count
  const fetchCartCount = async () => {
    const userData = getUserData();
    if (userData && userData.uid) {
      try {
        const userDoc = await getDocumentData('users', userData.uid);
        const cart = userDoc?.carts || [];
        const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalCount);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Check localStorage for user data
    const checkUserAuth = () => {
      const storedUser = localStorage.getItem('userInfo')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          // Fetch cart count when user is logged in
          fetchCartCount();
        } catch (error) {
          console.error('Error parsing user data:', error)
          setUser(null)
          setCartCount(0);
        }
      } else {
        setUser(null)
        setCartCount(0);
      }
    }

    // Initial check
    checkUserAuth()

    // Listen for storage changes (when user logs in/out from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
            fetchCartCount();
          } catch (error) {
            console.error('Error parsing user data from storage:', error)
            setUser(null)
            setCartCount(0);
          }
        } else {
          setUser(null)
          setCartCount(0);
        }
      }
    }

    // Custom event for auth state changes within the same tab
    const handleAuthChange = (event) => {
      checkUserAuth()
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthChange)
    window.addEventListener('cartUpdated', handleCartUpdate)

    // Check auth state on route changes
    const checkAuthOnRouteChange = () => {
      setTimeout(checkUserAuth, 100) // Small delay to ensure localStorage is updated
    }

    // Listen for route changes
    window.addEventListener('popstate', checkAuthOnRouteChange)

    // Also check on visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUserAuth()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('popstate', checkAuthOnRouteChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()

    setUser(null)
    setIsProfileDropdownOpen(false)
    // Refresh the website and redirect to homepage
    window.location.href = '/'
  }

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <Link to="/">
            <img
              src="/kaaflogo.png"
              alt="Kaaf Logo"
              className="nav-logo"
            />
          </Link>
        </div>



        {/* Header actions */}
        <div className="header-actions">
          <Link to="/wishlist" className="wishlist-link" aria-label="Wishlist">
            <FaHeart size={24} className='text-danger'/>
          </Link>
          <Link to="/cart" className="cart-link">
            <div className="cart-container">
              <LuShoppingCart className="cart-icon" size={24} />
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </div>
          </Link>


          {user ? (
            /* Profile Button - When logged in */
            <Link to="/account" className="profile-button" aria-label="Account">
              {/* <span className="username-display">
                {user.displayName || user.name || user.email || 'User'}
              </span> */}
              <FaUserCircle size={24} />
            </Link>

          ) : (
            /* Login Button - When not logged in */
            <Link to="/login" className="btn-custom-yellow login-button">
              Login
            </Link>
          )}

          <button className="btn-custom-yellow" title="Download App">
            <RiMobileDownloadLine size={20} />
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Header
