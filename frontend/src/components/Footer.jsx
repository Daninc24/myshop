import React, { useState, useEffect } from 'react';
import axios from 'axios';

const whatsappNumber = '254791991154'; // Replace with your WhatsApp number (country code + number, no + sign)
const whatsappLink = `https://wa.me/${whatsappNumber}`;
const phoneNumber = '+254791991154'; // Replace with your phone number
const email = 'info@myshoppingcenter.com'; // Replace with your email
const facebookLink = 'https://facebook.com/myshoppingcenter'; // Replace with your Facebook page
const twitterLink = 'https://twitter.com/myshoppingcenter'; // Replace with your Twitter profile
const eventsLink = '/events';

const Footer = () => {
  // Service rating state
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [userName, setUserName] = useState('');

  // Load average from localStorage (or backend in real app)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('serviceRatings') || '[]');
    if (stored.length > 0) {
      const avg = stored.reduce((sum, r) => sum + r.rating, 0) / stored.length;
      setAverageRating(avg);
      setRatingCount(stored.length);
    }
  }, []);

  const handleRate = (rating) => {
    setUserRating(rating);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/testimonials', {
        rating: userRating,
        message: userMessage,
        name: userName || 'Anonymous',
      });
      setSubmitted(true);
      setUserMessage('');
      setUserName('');
    } catch (err) {
      alert('Failed to submit rating. Please try again.');
    }
  };

  return (
    <footer className="bg-surface border-t border-gray-100 mt-12 py-10 px-4 text-secondary">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        {/* Contact & Social */}
        <div className="flex-1 flex flex-col gap-4">
          <h3 className="text-xl font-heading font-bold mb-2">Contact Us</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">Phone:</span>
            <a href={`tel:${phoneNumber}`} className="text-primary hover:underline">{phoneNumber}</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Email:</span>
            <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook</a>
            <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter</a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a>
          </div>
        </div>
        {/* Service Rating */}
        <div className="flex-1 flex flex-col gap-4 items-center md:items-end">
          <h3 className="text-xl font-heading font-bold mb-2">Rate Our Service</h3>
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className={`text-2xl ${userRating >= star ? 'text-primary' : 'text-gray-300'} focus:outline-none`}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            className="input-field max-w-xs mb-2"
          />
          <textarea
            placeholder="Leave a message..."
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            className="input-field max-w-xs mb-2"
            rows={2}
          />
          <button onClick={handleSubmit} className="btn-primary w-full max-w-xs">Submit Rating</button>
          {submitted && <div className="text-success font-medium mt-2">Thank you for your feedback!</div>}
          <div className="text-sm text-gray-500 mt-2">Average rating: <span className="font-bold text-primary">{averageRating.toFixed(1)}</span> ({ratingCount} ratings)</div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} MyShopping Center. All rights reserved.</div>
    </footer>
  );
};

export default Footer; 