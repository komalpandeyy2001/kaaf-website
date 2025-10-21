import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { emailPasswordLogin } from "./Firebase/FirebaseAuth/UserLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract search params
  const searchParams = new URLSearchParams(location.search);

  const redirect = searchParams.get("redirect");
  const programId = searchParams.get("programId");
  const programName = searchParams.get("programName");
  const eventId = searchParams.get("eventId");
  const eventName = searchParams.get("eventName");
  const price = searchParams.get("price");
  const source = searchParams.get("source");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await emailPasswordLogin(email, password);

      if (result.success) {
        // Notify other components
        window.dispatchEvent(new Event("authStateChanged"));

        if (redirect) {
          // Prepare registration data to pass
          const registrationData = {};

          if (programId) {
            registrationData.programId = programId;
            registrationData.programName = programName;
          }

          if (eventId) {
            registrationData.eventId = eventId;
            registrationData.eventName = eventName;
          }

          if (price) registrationData.price = price;
          if (source) registrationData.source = source;

          navigate(redirect, { state: registrationData });
        } else {
          navigate("/");
        }
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your Kaaf account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className='bg-white text-dark border border-gray-300 rounded-3 px-2 py-1 w-full'
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className='bg-white border text-dark border-gray-300 rounded-3 px-2 py-1 w-full'
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.45 18.45 0 0 1-5.06 5.94M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path d="M1 1l22 22"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* <div className="form-links">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div> */}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
  <p>
    Don't have an account?{" "}
    <Link to={`/signup${location.search}`}>Sign up here</Link>
  </p>
</div>

      </div>
    </div>
  );
};

export default Login;
