import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LuBookText } from "react-icons/lu";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { isUserLoggedIn } from '../src/utils/authState';
import { toast } from 'react-toastify';
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
      const profileDropdownRef = useRef(null)  
    const [user, setUser] = useState(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const location = useLocation();
const currentPath = location.pathname;

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

const navigate = useNavigate();

const handleBookSession = () => {
  if (isUserLoggedIn()) {
    navigate("/book-class");
  } else {
    toast.info("Please sign in to book a class.");
    navigate(`/login?redirect=/book-class`);
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

        // Listen for window resize to update isMobile
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }
        window.addEventListener('resize', handleResize)

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
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('popstate', checkAuthOnRouteChange)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen)
    }

    const closeProfileDropdown = () => {
        setIsProfileDropdownOpen(false)
    }

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
                            src="/images/PrimaryLogo.png"
                            alt="BeeTennis Logo"
                            className="nav-logo"
                        />
                    </Link>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                {/* Navigation Links */}
                <ul className={`nav-links ${isMenuOpen ? 'nav-links--open' : ''}`}>
                    <li><Link to="/" onClick={() => setIsMenuOpen(false)} className={currentPath === '/' ? 'active-link' : ''}>Home</Link></li>
                    <li><Link to="/programs" onClick={() => setIsMenuOpen(false)} className={currentPath === '/programs' ? 'active-link' : ''}>Programs</Link></li>
                 
                    <li><Link to="/pickleball-tennis" onClick={() => setIsMenuOpen(false)} className={currentPath === '/pickleball-tennis' ? 'active-link' : ''}>Pickleball & Tennis</Link></li>
                    <li><Link to="/events" onClick={() => setIsMenuOpen(false)} className={currentPath === '/events' ? 'active-link' : ''}>Events</Link></li>
                
                       <li><a href="https://zallesracquetsports.rainadmin.com" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>Retail Store</a></li>
                        <li><Link to="/career" onClick={() => setIsMenuOpen(false)} className={currentPath === '/career' ? 'active-link' : ''}>Career</Link></li>
                    {/* Book Class Button - Inside toggle menu for mobile */}
                    <li className="mobile-book-class" style={{ display: isMobile ? 'block' : 'none' }}>
                        <Link to="/book-class" className="btn-custom-yellow book-button" onClick={() => setIsMenuOpen(false)}>
                            <span className='pe-2 py-2'><LuBookText /></span>Book a class
                        </Link>
                    </li>

                    {/* User Profile/Login - Inside toggle menu for mobile */}
                    <li className="mobile-user-section" style={{ display: isMobile ? 'block' : 'none' }}>
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
    <div className="profile-dropdown absolute   bg-white  rounded-md z-50">
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
                            <Link to="/login" className="btn-custom-yellow login-button" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                        )}
                    </li>
                </ul>

                {/* Desktop-only header actions */}
                <div className="header-actions desktop-only" style={{ display: isMobile ? 'none' : 'flex' }}>
                
                                                                       <button 
  className="btn session-button btn-lg"
  onClick={handleBookSession}
>
 <LuBookText />  Book a class
</button>

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
                </div>
            </nav>
        </header>
    )
}

export default Header
