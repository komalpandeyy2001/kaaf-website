import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { emailPasswordSignUp } from "./Firebase/FirebaseAuth/UserSignUp";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithGoogle } from "./Firebase/FirebaseAuth/GoogleAuth";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!fullName.trim()) return toast.error("Please enter your full name");
    if (!email.trim()) return toast.error("Please enter your email address");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("Please enter a valid email address");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      const result = await emailPasswordSignUp(fullName, email, password);

      if (result.success) {
        toast.success("Sign up successful!");
        navigate("/");
      } else {
        toast.error(result.error || "Sign up failed");
      }
    } catch (error) {
      toast.error(error.message || "Sign up failed");
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
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="text-center">Create Account</h2>
        <p className="text-center text-warning fw-bold">Join Qaaf today</p>

        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="input-field"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ?  <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="input-field"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ?  <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Creating Account..." : "Create Account"}
          </button>


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

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
