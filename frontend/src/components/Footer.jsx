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
    <footer className="bg-surface border-t border-gray-100 mt-12 py-12 px-4 text-secondary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Newsletter */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo192.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-lg" />
            <span className="font-heading text-2xl font-bold text-primary">MyShopping Center</span>
          </div>
          <p className="text-gray-500 mb-2">Your one-stop shop for everything awesome. Enjoy seamless shopping, fast delivery, and great deals!</p>
          <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); alert('Subscribed!'); }}>
            <label htmlFor="newsletter" className="font-medium">Subscribe to our newsletter</label>
            <div className="flex gap-2">
              <input id="newsletter" type="email" required placeholder="Your email" className="input-field flex-1" />
              <button type="submit" className="btn-primary">Subscribe</button>
            </div>
          </form>
          <div className="flex gap-3 mt-4">
            <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><img src="/icons/facebook.svg" alt="Facebook" className="w-6 h-6" /></a>
            <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><img src="/icons/twitter.svg" alt="Twitter" className="w-6 h-6" /></a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><img src="/icons/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" /></a>
          </div>
        </div>
        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-heading font-bold mb-2">Quick Links</h3>
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <a href="/products" className="hover:text-primary transition-colors">Shop</a>
          <a href="/about" className="hover:text-primary transition-colors">About Us</a>
          <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
          <a href="/faq" className="hover:text-primary transition-colors">FAQ</a>
          <a href={eventsLink} className="hover:text-primary transition-colors">Events</a>
        </div>
        {/* Contact Info */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-heading font-bold mb-2">Contact Us</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">Phone:</span>
            <a href={`tel:${phoneNumber}`} className="text-primary hover:underline">{phoneNumber}</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Email:</span>
            <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-medium">Location:</span>
            <span>Nairobi, Kenya</span>
          </div>
          <div className="flex gap-2 mt-2">
            <img src="/icons/visa.svg" alt="Visa" className="w-8 h-6" />
            <img src="/icons/mastercard.svg" alt="MasterCard" className="w-8 h-6" />
            <img src="/icons/paypal.svg" alt="PayPal" className="w-8 h-6" />
          </div>
        </div>
        {/* Service Rating */}
        <div className="flex flex-col gap-4 items-center md:items-end">
          <h3 className="text-lg font-heading font-bold mb-2">Rate Our Service</h3>
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className={`text-2xl ${userRating >= star ? 'text-primary' : 'text-gray-300'} focus:outline-none transition-colors`}
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
      <div className="border-t border-gray-200 mt-10 pt-6 text-center text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>&copy; {new Date().getFullYear()} MyShopping Center. All rights reserved.</span>
        <a href="#top" className="text-primary hover:underline">Back to Top ↑</a>
      </div>
    </footer>
  );
};

export default Footer;