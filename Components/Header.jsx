import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaUserCircle } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";
import { FiDownload } from "react-icons/fi";
import { RiMobileDownloadLine } from "react-icons/ri";
import './Header.css';

function Header() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [user, setUser] = useState(null)

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

  useEffect(() => {
    // Check localStorage for user data
    const checkUserAuth = () => {
      const storedUser = localStorage.getItem('userInfo')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
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
          } catch (error) {
            console.error('Error parsing user data from storage:', error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }

    // Custom event for auth state changes within the same tab
    const handleAuthChange = (event) => {
      checkUserAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthChange)

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
              src="src/assets/kaaflogo.png"
              alt="Kaaf Logo"
              className="nav-logo"
            />
          </Link>
        </div>



        {/* Header actions */}
        <div className="header-actions">
          <LuShoppingCart className="cart-icon" size={24} />


          {user ? (
            /* Profile Dropdown - When logged in */
            <div className="relative" ref={profileDropdownRef}>
              {/* Toggle Button */}
              <button
                className="profile-button"
                onClick={(e) => {
                  e.stopPropagation(); // stop bubbling to document
                  setIsProfileDropdownOpen((prev) => !prev);
                }}
                aria-label="Profile menu"
              >
                <span className="username-display">
                  {user.displayName || user.name || user.email || 'User'}
                </span>
                <FaUserCircle size={24} />
                <IoMdArrowDropdown
                  size={16}
                  className={`dropdown-arrow ${isProfileDropdownOpen ? 'open' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                  <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/registrations" onClick={() => setIsProfileDropdownOpen(false)}>
                    Registrations
                  </Link>
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </div>
              )}
            </div>

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
