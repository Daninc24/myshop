import React from "react";

export default function Contact() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 bg-white transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-blue-900">Contact</h1>
      <section className="max-w-xl w-full flex flex-col gap-4 bg-blue-50 p-6 rounded-xl shadow mb-8">
        <div className="flex items-center gap-2">
          <span className="font-bold">Phone:</span>
          <a href="tel:+254700000000" className="text-primary hover:underline">+254 700 000 000</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Email:</span>
                      <a href="mailto:info@myshop.com" className="text-primary hover:underline">info@myshop.com</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Location:</span>
          <span>Nairobi, Kenya</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Business Hours:</span>
          <span>Mon - Sat: 8:00am - 8:00pm</span>
        </div>
      </section>
      <section className="max-w-xl w-full mb-8">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Send Us a Message</h2>
        <form className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow" onSubmit={e => {e.preventDefault(); alert('Message sent!')}}>
          <input type="text" placeholder="Your Name" className="input-field" required />
          <input type="email" placeholder="Your Email" className="input-field" required />
          <textarea placeholder="Your Message" className="input-field" rows={4} required />
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      </section>
      <section className="max-w-xl w-full mb-4">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Find Us</h2>
        <div className="rounded-xl overflow-hidden shadow border border-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.157792971863!2d36.8219467!3d-1.2920659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10e8c1a4b3fb%3A0x7c8cfae9e1e4e3e4!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1680000000000!5m2!1sen!2ske"
            width="100%"
            height="180"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Store Location"
            className="w-full h-44"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
