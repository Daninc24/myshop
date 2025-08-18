import React from "react";

export default function About() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 bg-background transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-text-primary">About Us</h1>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-text-primary">Who We Are</h2>
        <p className="text-lg text-text-primary mb-4">Welcome to LuxeCart! We are passionate about delivering the best shopping experience with a diverse range of products, unbeatable deals, and top-notch customer service. Based in Nairobi, Kenya, we proudly serve customers nationwide.</p>
      </section>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-text-primary">Our Mission</h2>
        <p className="text-md text-text-secondary mb-4">Our mission is to make shopping easy, fun, and accessible for everyone. We strive to bring you the latest products, exclusive promotions, and a seamless online experience from browsing to checkout.</p>
      </section>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-text-primary">Why Shop With Us?</h2>
        <ul className="list-disc list-inside text-text-primary mb-4 space-y-2">
          <li>Wide selection of quality products at competitive prices</li>
          <li>Fast, reliable delivery across Kenya</li>
          <li>Secure payments with multiple options</li>
          <li>Friendly customer support ready to help you</li>
          <li>Exciting events, deals, and loyalty rewards</li>
        </ul>
      </section>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-text-primary">Meet Our Team</h2>
        <p className="text-md text-text-secondary mb-2">Our dedicated team is committed to making your shopping experience amazing. From product experts to support staff, we work together to serve you better every day.</p>
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <div className="bg-surface rounded-xl p-4 shadow text-center">
            <div className="font-bold text-text-primary">Diana N.</div>
            <div className="text-xs text-text-muted">Founder & CEO</div>
          </div>
          <div className="bg-surface rounded-xl p-4 shadow text-center">
            <div className="font-bold text-text-primary">Samuel K.</div>
            <div className="text-xs text-text-muted">Head of Operations</div>
          </div>
          <div className="bg-surface rounded-xl p-4 shadow text-center">
            <div className="font-bold text-text-primary">Grace M.</div>
            <div className="text-xs text-text-muted">Customer Support Lead</div>
          </div>
        </div>
      </section>
      <section className="max-w-2xl w-full text-center">
        <p className="text-sm text-text-muted">Thank you for choosing us as your go-to shopping destination!</p>
      </section>
    </div>
  );
}
