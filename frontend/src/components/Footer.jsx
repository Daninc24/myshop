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
    <footer className="bg-gradient-to-r from-primary to-secondary border-t border-primary mt-12 py-4 sm:py-6 px-2 sm:px-4 text-white transition-colors duration-300">
  {/* Responsive grid: 1col xs, 2col sm, 3col md, 5col lg */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
        {/* Brand & Newsletter */}
        {/* Latest Events & Promotions */}
        <div className="flex flex-col gap-2 md:col-span-1 items-center sm:items-start">
  <h3 className="text-lg font-heading font-bold mb-2">Rate Our Service</h3>
  <div className="flex items-center gap-2 mb-2">
    {[1,2,3,4,5].map(star => (
      <button
        key={star}
        onClick={() => handleRate(star)}
                        className={`text-2xl ${userRating >= star ? 'text-primary' : 'text-text-muted'} focus:outline-none transition-colors`}
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
    className="input-field max-w-xs w-full mb-2"
  />
  <textarea
    placeholder="Leave a message..."
    value={userMessage}
    onChange={e => setUserMessage(e.target.value)}
    className="input-field max-w-xs w-full mb-2"
    rows={2}
  />
  <button onClick={handleSubmit} className="btn-primary w-full max-w-xs">Submit Rating</button>
  {submitted && <div className="text-success font-medium mt-2">Thank you for your feedback!</div>}
  <div className="text-sm text-gray-500 mt-2">Average rating: <span className="font-bold text-primary">{averageRating.toFixed(1)}</span> ({ratingCount} ratings)</div>
</div>
        {/* Store Location Map */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <h3 className="text-lg font-heading font-bold mb-2">Our Location</h3>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="150"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
              className="w-full h-40 md:h-32"
            ></iframe>
          </div>
          <span className="text-xs text-gray-500">Nairobi, Kenya</span>
        </div>
        <div className="flex flex-col gap-2 col-span-1 items-center sm:items-start">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2 w-full">
            <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto sm:mx-0">
              <span className="font-heading text-lg font-bold text-primary">LC</span>
            </div>
            <span className="font-heading text-xl sm:text-2xl font-bold text-white drop-shadow text-center sm:text-left">{getBrandName()}</span>
          </div>
          <p className="text-text-secondary mb-2">Your one-stop shop for everything awesome. Enjoy seamless shopping, fast delivery, and great deals!</p>
          <form className="flex flex-col gap-2 w-full" onSubmit={e => { e.preventDefault(); alert('Subscribed!'); }}>
  <label htmlFor="newsletter" className="font-medium">Subscribe to our newsletter</label>
  <div className="flex flex-col xs:flex-row gap-2 w-full">
    <input id="newsletter" type="email" required placeholder="Your email" className="input-field flex-1 min-w-0" />
    <button type="submit" className="btn-primary w-full xs:w-auto">Subscribe</button>
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
        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-heading font-bold mb-2">Quick Links</h3>
         <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
         <Link to="/products" className="hover:text-white/80 transition-colors">Products</Link>
         <Link to="/about" className="hover:text-white/80 transition-colors">About Us</Link>
         <Link to="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
         <Link to="/faq" className="hover:text-white/80 transition-colors">FAQ</Link>
         <Link to="/events" className="hover:text-white/80 transition-colors">Events</Link>
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
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="font-medium">Location:</span>
            <span>Nairobi, Kenya</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-white rounded shadow p-1 text-xs font-bold text-gray-700 px-2 py-1">VISA</span>
            <span className="bg-white rounded shadow p-1 text-xs font-bold text-gray-700 px-2 py-1">MC</span>
            <span className="bg-white rounded shadow p-1 text-xs font-bold text-gray-700 px-2 py-1">PP</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 mt-6 pt-2 text-center text-xs text-white/80 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>&copy; {new Date().getFullYear()} {getBrandName()}. All rights reserved.</span>
        <a href="#top" className="text-white hover:underline">Back to Top ↑</a>
      </div>
    </footer>
  );
};

export default Footer;