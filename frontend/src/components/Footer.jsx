import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getBrandName, getBrandEmail, getBrandPhone, getSocialLinks } from '../config/branding';
import { 
  StarIcon,
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const EventsPreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/events?upcoming=true');
        setEvents(Array.isArray(res.data) ? res.data.slice(0, 3) : []);
      } catch (err) {
        setError('Could not load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-gray-400 text-xs">Loading events…</div>;
  if (error) return <div className="text-red-500 text-xs">{error}</div>;
  if (!events.length) return <div className="text-gray-400 text-xs">No upcoming events.</div>;

  return (
    <ul className="space-y-1 text-sm">
      {events.map(event => (
        <li key={event._id || event.title}>
          <span className="font-medium text-primary">{event.title}</span>
          {event.date && (
            <span className="ml-2 text-xs text-gray-500">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          )}
          {event.link ? (
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-primary">More Info</a>
          ) : null}
        </li>
      ))}
      <li>
        <Link to="/events" className="underline hover:text-primary text-xs">See all events &rarr;</Link>
      </li>
    </ul>
  );
};

const whatsappNumber = '254791991154';
const whatsappLink = `https://wa.me/${whatsappNumber}`;
const phoneNumber = getBrandPhone();
const email = getBrandEmail();
const socialLinks = getSocialLinks();
const eventsLink = '/events';



const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.16228411687!2d36.821946!3d-1.292066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d2d5555555%3A0x5b7f5e5e5e5e5e5e!2sNairobi!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske';


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
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t-4 border-orange-500 mt-12 py-8 sm:py-10 px-4 sm:px-6 text-white transition-colors duration-300">
      {/* Responsive grid: 1col xs, 2col sm, 3col md, 5col lg */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 md:gap-10">
        
        {/* Brand & Newsletter */}
        <div className="flex flex-col gap-3 col-span-1 items-center sm:items-start">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2 w-full">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex items-center justify-center mx-auto sm:mx-0">
              <span className="font-heading text-xl font-bold text-white">LC</span>
            </div>
            <span className="font-heading text-2xl sm:text-3xl font-bold text-white drop-shadow-lg text-center sm:text-left">{getBrandName()}</span>
          </div>
          <p className="text-gray-300 mb-3 text-sm leading-relaxed">Your one-stop shop for everything awesome. Enjoy seamless shopping, fast delivery, and great deals!</p>
          <form className="flex flex-col gap-2 w-full" onSubmit={e => { e.preventDefault(); alert('Subscribed!'); }}>
            <label htmlFor="newsletter" className="font-semibold text-white">Subscribe to our newsletter</label>
            <div className="flex flex-col xs:flex-row gap-2 w-full">
              <input 
                id="newsletter" 
                type="email" 
                required 
                placeholder="Your email" 
                className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
              />
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl w-full xs:w-auto">Subscribe</button>
            </div>
          </form>
          <div className="flex gap-3 mt-4 justify-center sm:justify-start">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform hover:bg-white/20 rounded-full p-2">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </a>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform hover:bg-white/20 rounded-full p-2">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform hover:bg-white/20 rounded-full p-2">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </a>
          </div>
          
        </div>
        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-heading font-bold mb-2 text-white">Quick Links</h3>
          <Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium">Home</Link>
          <Link to="/products" className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium">Products</Link>
          <Link to="/about" className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium">About Us</Link>
          <Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium">Contact</Link>
          <Link to="/faq" className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium">FAQ</Link>
          <Link to="/events" className="text-gray-300 hover:text-orange-400 transition-colors text-sm font-medium">Events</Link>
        </div>
        
        {/* Contact Info */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-heading font-bold mb-2 text-white">Contact Us</h3>
          <div className="flex items-start gap-2">
            <PhoneIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Phone</span>
              <a href={`tel:${phoneNumber}`} className="text-white hover:text-orange-400 transition-colors font-medium">{phoneNumber}</a>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <EnvelopeIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Email</span>
              <a href={`mailto:${email}`} className="text-white hover:text-orange-400 transition-colors font-medium break-all">{email}</a>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs">Location</span>
              <span className="text-white font-medium">Nairobi, Kenya</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-white rounded-lg shadow-md px-3 py-1.5 text-xs font-bold text-gray-800">VISA</span>
            <span className="bg-white rounded-lg shadow-md px-3 py-1.5 text-xs font-bold text-gray-800">MC</span>
            <span className="bg-white rounded-lg shadow-md px-3 py-1.5 text-xs font-bold text-gray-800">PayPal</span>
          </div>
        </div>
        
        {/* Rate Our Service */}
        <div className="flex flex-col gap-3 md:col-span-1 items-center sm:items-start">
          <h3 className="text-xl font-heading font-bold mb-2 text-white">Rate Our Service</h3>
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-3xl ${(hoverRating || userRating) >= star ? 'text-yellow-400' : 'text-gray-600'} focus:outline-none transition-all duration-200 hover:scale-110`}
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
            className="w-full max-w-xs px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          />
          <textarea
            placeholder="Leave a message..."
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            className="w-full max-w-xs px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            rows={3}
          />
          <button 
            onClick={handleSubmit} 
            disabled={!userRating}
            className="w-full max-w-xs px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Submit Rating
          </button>
          {submitted && <div className="text-green-400 font-medium mt-2 text-sm">✓ Thank you for your feedback!</div>}
          {averageRating > 0 && (
            <div className="text-sm text-gray-300 mt-2">
              Average: <span className="font-bold text-yellow-400">{averageRating.toFixed(1)}★</span> ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </div>
          )}
        </div>
        
        {/* Store Location Map */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <h3 className="text-xl font-heading font-bold mb-2 text-white">Our Location</h3>
          <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white/10">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
              className="w-full h-48"
            ></iframe>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300">Nairobi, Kenya</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span>&copy; {new Date().getFullYear()} {getBrandName()}. All rights reserved.</span>
        <div className="flex gap-4 items-center">
          <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">Terms of Service</Link>
          <a href="#top" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Back to Top ↑</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;