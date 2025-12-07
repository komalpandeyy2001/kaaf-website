import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { emailPasswordLogin } from "./Firebase/FirebaseAuth/UserLogin";
import { signInWithGoogle } from "./Firebase/FirebaseAuth/GoogleAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ---- Email + Password Login ----
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await emailPasswordLogin(email, password);

      if (result.success) {
        window.dispatchEvent(new Event("authStateChanged"));
        navigate("/"); // redirect to home
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---- Google Login ----
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      window.dispatchEvent(new Event("authStateChanged"));
      navigate("/"); // redirect to home
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className= "">
     <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header text-center mb-4">
          <h2>Welcome Back</h2>
          <p>Sign in to your Kaaf account</p>
        </div>

        {error && <div className="error-message text-danger mb-3">{error}</div>}

        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="form-group mb-3">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="bg-white text-dark border border-gray-300 rounded-3 px-2 py-1 w-full"
            />
          </div>

          {/* Password Input */}
          <div className="form-group mb-3">
            <label htmlFor="password">Password</label>
            <div className="password-input-container position-relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="bg-white border text-dark border-gray-300 rounded-3 px-2 py-1 w-full"
              />
              <button
                type="button"
                className="password-toggle position-absolute  bg-transparent border-0"
                onClick={() => setShowPassword(!showPassword)}
              >
            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-button w-100 btn btn-primary mb-3"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Forgot Password Link */}
            <div className="text-end mb-3">
              <Link to="/forgot-password" className="text-primary" style={{ fontSize: "14px" }}>
                Forgot Password?
              </Link>
            </div>

          {/* Divider */}
          <div className="divider text-center my-3">OR</div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="auth-button w-100 btn d-flex align-items-center justify-content-center gap-2"
            style={{ backgroundColor: "#ffffffff", color: "#000000ff", border: "1px solid #dcdcdcff" }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={{ width: "20px", height: "20px" }}
            />
            Continue with Google
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to={`/signup${location.search}`}>Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
