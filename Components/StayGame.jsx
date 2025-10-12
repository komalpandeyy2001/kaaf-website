import React, { useState, useEffect } from 'react';
import { FaRegEnvelope } from 'react-icons/fa';
import { getDocumentData } from '../src/pages/Firebase/CloudFirestore/GetData';
import { subscribeToNewsletter } from '../src/pages/Firebase/CloudFirestore/NewsletterService';

function StayGame() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [newsletterConfig, setNewsletterConfig] = useState(null);
    const [configLoading, setConfigLoading] = useState(true);

    // Fetch dynamic newsletter configuration
    useEffect(() => {
        const fetchNewsletterConfig = async () => {
            try {
                const data = await getDocumentData('webDesign', 'newsLetterContent');
                setNewsletterConfig(data || {
                    title: "Stay In the Game",
                    subtitle: "Get the latest updates on programs, events, and exclusive offers delivered to your inbox",
                    placeholderText: "Enter your email",
                    buttonText: "Subscribe",
                    disclaimer: "We respect your privacy. Unsubscribe at any time."
                });
            } catch (err) {
                console.error('Error fetching newsletter config:', err);
                // Fallback to default values
                setNewsletterConfig({
                    title: "Stay In the Game",
                    subtitle: "Get the latest updates on programs, events, and exclusive offers delivered to your inbox",
                    placeholderText: "Enter your email",
                    buttonText: "Subscribe",
                    disclaimer: "We respect your privacy. Unsubscribe at any time."
                });
            } finally {
                setConfigLoading(false);
            }
        };

        fetchNewsletterConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            setIsLoading(true);
            setError('');
            
            try {
                // Add email to newsletter collection using the new service
                await subscribeToNewsletter(email, 'staygame');
                
                setIsSubscribed(true);
                setEmail('');
                setTimeout(() => setIsSubscribed(false), 3000);
            } catch (err) {
                setError('Failed to subscribe. Please try again.');
                console.error('Subscription error:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (configLoading) {
        return (
            <section className='my-5 mx-3'>
                <div className="container border shadow rounded-4 p-3">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading newsletter configuration...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='my-5 mx-3'>
            <div className="container border shadow rounded-4 p-3">
                <div className="text-center mb-5">
                    <FaRegEnvelope size={50} className="me-2 text-dark" />
                    <div className="fw-bold fs-2">
                        {newsletterConfig?.title || 'Stay In the Game'}
                    </div>
                    <p className="fs-5 text-gray">
                        {newsletterConfig?.subtitle || 
                            'Get the latest updates on programs, events, and exclusive offers delivered to your inbox'}
                    </p>

                    {isSubscribed ? (
                        <div className="alert alert-success mt-4" role="alert">
                            Thank you for subscribing!
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="d-flex   flex-row justify-content-center gap-2 mt-4 flex-wrap">
                            <input
                                type="email"
                                className="form-control form-control-md w-50"
                                placeholder={newsletterConfig?.placeholderText || 'Enter your email'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                className="btn btn-custom-yellow btn-sm rounded-3 fs-6 px-4"
                                disabled={isLoading || !email.includes('@')}
                            >
                                {isLoading ? 'Subscribing...' : (newsletterConfig?.buttonText || 'Subscribe')}
                            </button>
                        </form>
                    )}
                    
                    {error && (
                        <div className="alert alert-danger mt-3" role="alert">
                            {error}
                        </div>
                    )}
                    
                    <p className="stay-game-disclaimer mt-3 text-muted small">
                        {newsletterConfig?.disclaimer || 
                            'We respect your privacy. Unsubscribe at any time.'}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default StayGame;
