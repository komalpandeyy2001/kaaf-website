import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserForgotPassword } from './Firebase/FirebaseAuth/UserForgotPassword';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await UserForgotPassword(email);
            setMessage('Password reset email sent! Please check your inbox and follow the instructions to reset your password.');
        } catch (error) {
            setError(error.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-header">
                    <h2>Forgot Password</h2>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form onSubmit={handleForgotPassword}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className='bg-white text-dark border border-gray-300 rounded-3 px-2 py-1 w-full  '

                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Sending Email...' : 'Send Reset Email'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Remember your password? <Link to="/login">Sign in here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
