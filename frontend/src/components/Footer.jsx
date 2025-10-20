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
import useResponsiveLayout from '../hooks/useResponsiveLayout';
import { getFooterLayout } from '../utils/responsiveHelpers';

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


const Footer = React.memo(() => {
  // Responsive layout hook
  const { screenSize, isMobile, isTablet } = useResponsiveLayout();
  const footerLayout = getFooterLayout(screenSize);
  
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
    <footer className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t-4 border-orange-500 mt-8 text-white transition-colors duration-300 ${footerLayout.padding} ${footerLayout.maxHeight || ''}`}>
      {/* Responsive grid with dynamic columns */}
      <div className={`max-w-7xl mx-auto grid ${footerLayout.gap}`} style={{ gridTemplateColumns: `repeat(${footerLayout.columns}, minmax(0, 1fr))` }}>
        
        {/* Brand & Newsletter */}
        <div className={`flex flex-col ${isMobile ? 'gap-1' : 'gap-2'} col-span-1 items-center sm:items-start`}>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} items-center ${isMobile ? 'gap-1' : 'gap-1 sm:gap-2'} mb-1 w-full`}>
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'} bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg flex items-center justify-center mx-auto sm:mx-0`}>
              <span className={`font-heading ${isMobile ? 'text-sm' : 'text-lg sm:text-xl'} font-bold text-white`}>LC</span>
            </div>
            <span className={`font-heading ${isMobile ? 'text-sm' : 'text-lg sm:text-xl md:text-2xl'} font-bold text-white drop-shadow-lg text-center sm:text-left`}>{getBrandName()}</span>
          </div>
          {!isMobile && <p className="text-gray-300 mb-2 text-xs sm:text-sm leading-relaxed hidden xs:block">Your one-stop shop for everything awesome.</p>}
          <div className={`flex ${isMobile ? 'gap-1' : 'gap-2'} mt-2 justify-center sm:justify-start`}>
            {/* Facebook */}
            <a 
              href={socialLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center bg-white/10 hover:bg-blue-600 rounded-full transition-all duration-200 hover:scale-110 touch-target-sm`}
              aria-label="Facebook"
            >
              <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            {/* Twitter/X */}
            <a 
              href={socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center bg-white/10 hover:bg-black rounded-full transition-all duration-200 hover:scale-110 touch-target-sm`}
              aria-label="Twitter"
            >
              <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            
            {/* WhatsApp */}
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center bg-white/10 hover:bg-green-500 rounded-full transition-all duration-200 hover:scale-110 touch-target-sm`}
              aria-label="WhatsApp"
            >
              <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
          
        </div>
        {/* Quick Links */}
        <div className={`flex flex-col ${isMobile ? 'gap-1' : 'gap-2'}`}>
          <h3 className={`${footerLayout.titleSize} font-heading font-bold ${isMobile ? 'mb-0.5' : 'mb-1'} text-white`}>Quick Links</h3>
          <Link to="/" className={`text-gray-300 hover:text-orange-400 transition-colors ${footerLayout.textSize} font-medium touch-target-sm`}>Home</Link>
          <Link to="/products" className={`text-gray-300 hover:text-orange-400 transition-colors ${footerLayout.textSize} font-medium touch-target-sm`}>Products</Link>
          <Link to="/about" className={`text-gray-300 hover:text-orange-400 transition-colors ${footerLayout.textSize} font-medium touch-target-sm`}>About Us</Link>
          <Link to="/contact" className={`text-gray-300 hover:text-orange-400 transition-colors ${footerLayout.textSize} font-medium touch-target-sm`}>Contact</Link>
          <Link to="/faq" className={`text-gray-300 hover:text-orange-400 transition-colors ${footerLayout.textSize} font-medium touch-target-sm`}>FAQ</Link>
          <Link to="/events" className={`text-gray-300 hover:text-orange-400 transition-colors ${footerLayout.textSize} font-medium touch-target-sm`}>Events</Link>
        </div>
        
        {/* Contact Info */}
        <div className={`flex flex-col ${isMobile ? 'gap-1' : 'gap-2'}`}>
          <h3 className={`${footerLayout.titleSize} font-heading font-bold ${isMobile ? 'mb-0.5' : 'mb-1'} text-white`}>Contact Us</h3>
          <div className={`flex items-start ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <PhoneIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} text-orange-400 flex-shrink-0 mt-0.5`} />
            <div className="flex flex-col">
              <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Phone</span>
              <a href={`tel:${phoneNumber}`} className={`text-white hover:text-orange-400 transition-colors font-medium ${footerLayout.textSize} touch-target-sm`}>{phoneNumber}</a>
            </div>
          </div>
          <div className={`flex items-start ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <EnvelopeIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} text-orange-400 flex-shrink-0 mt-0.5`} />
            <div className="flex flex-col">
              <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Email</span>
              <a href={`mailto:${email}`} className={`text-white hover:text-orange-400 transition-colors font-medium break-all ${footerLayout.textSize} touch-target-sm`}>{email}</a>
            </div>
          </div>
          <div className={`flex items-start ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <MapPinIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'} text-orange-400 flex-shrink-0 mt-0.5`} />
            <div className="flex flex-col">
              <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Location</span>
              <span className={`text-white font-medium ${footerLayout.textSize}`}>Nairobi, Kenya</span>
            </div>
          </div>
          {!isMobile && (
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="bg-white rounded-md shadow-md px-2 py-1 text-xs font-bold text-gray-800">VISA</span>
              <span className="bg-white rounded-md shadow-md px-2 py-1 text-xs font-bold text-gray-800">MC</span>
              <span className="bg-white rounded-md shadow-md px-2 py-1 text-xs font-bold text-gray-800">PayPal</span>
            </div>
          )}
        </div>
        
        {/* Rate Our Service - Hidden on mobile to save space */}
        {!isMobile && (
          <div className="flex flex-col gap-2 md:col-span-1 items-center sm:items-start">
            <h3 className={`${footerLayout.titleSize} font-heading font-bold mb-1 text-white`}>Rate Our Service</h3>
            <div className="flex items-center gap-1 mb-1">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`${isTablet ? 'text-lg' : 'text-2xl sm:text-3xl'} ${(hoverRating || userRating) >= star ? 'text-yellow-400' : 'text-gray-600'} focus:outline-none transition-all duration-200 hover:scale-110 touch-target-sm`}
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
              className={`w-full max-w-xs px-3 py-1 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${footerLayout.textSize} touch-target-sm`}
            />
            <textarea
              placeholder="Leave a message..."
              value={userMessage}
              onChange={e => setUserMessage(e.target.value)}
              className={`w-full max-w-xs px-3 py-1 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${footerLayout.textSize}`}
              rows={isTablet ? 1 : 2}
            />
            <button 
              onClick={handleSubmit} 
              disabled={!userRating}
              className={`w-full max-w-xs px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl ${footerLayout.textSize} touch-target-sm`}
            >
              Submit Rating
            </button>
            {submitted && <div className="text-green-400 font-medium mt-1 text-xs">✓ Thank you for your feedback!</div>}
            {averageRating > 0 && (
              <div className="text-xs text-gray-300 mt-1">
                Average: <span className="font-bold text-yellow-400">{averageRating.toFixed(1)}★</span> ({ratingCount} ratings)
              </div>
            )}
          </div>
        )}
        
        {/* Store Location Map - Simplified on mobile */}
        {isMobile ? (
          <div className="flex flex-col gap-1">
            <h3 className={`${footerLayout.titleSize} font-heading font-bold mb-0.5 text-white`}>Location</h3>
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-gray-300">Nairobi, Kenya</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 md:col-span-1">
            <h3 className={`${footerLayout.titleSize} font-heading font-bold mb-1 text-white`}>Our Location</h3>
            <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-white/10">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="120"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
                className={`w-full ${isTablet ? 'h-20' : 'h-24 sm:h-32 md:h-36'}`}
              ></iframe>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
              <span className={`${footerLayout.textSize} text-gray-300`}>Nairobi, Kenya</span>
            </div>
          </div>
        )}
      </div>
      <div className={`border-t border-white/10 ${isMobile ? 'mt-2 pt-2' : 'mt-2 sm:mt-4 pt-2 sm:pt-4'} text-center text-xs text-gray-400 flex flex-col sm:flex-row justify-between items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
        <span className={isMobile ? 'text-xs' : 'text-xs'}>&copy; {new Date().getFullYear()} {getBrandName()}. All rights reserved.</span>
        <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'} items-center text-xs`}>
          <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors touch-target-sm">Privacy</Link>
          <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors touch-target-sm">Terms</Link>
          <a href="#top" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors touch-target-sm">Top ↑</a>
        </div>
      </div>
    </footer>
  );
};

});

export default Footer;