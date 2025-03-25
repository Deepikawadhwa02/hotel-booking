import React, { useState } from 'react';
import axios from 'axios';
import "../styles/Newsletter.scss";

const Newsletter = () => {
  // State to manage email input and form submission
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle email input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous states
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      // Make API call to backend
      const response = await axios.post('http://localhost:3001/api/subscribe', { email });
      
      // Handle successful subscription
      setMessage(response.data.message);
      setIsSuccess(true);
      setEmail(''); // Clear the input
    } catch (error) {
      // Handle errors
      const errorMessage = error.response?.data?.message || 
        'An error occurred. Please try again.';
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="newsletter">
      <div className="newsletter_content">
        <div className="newsletter_text">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Stay updated with the latest news and offers.</p>
          
          <form 
            className="newsletter_form" 
            onSubmit={handleSubmit}
          >
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
            />
            <button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {message && (
            <div 
              className={`newsletter_message ${isSuccess ? 'success' : 'error'}`}
            >
              {message}
            </div>
          )}
        </div>
        <div className="newsletter_image">
          <img src="/assets/newsletter.jpg" alt="Newsletter" />
        </div>
      </div>
    </div>
  );
};

export default Newsletter;