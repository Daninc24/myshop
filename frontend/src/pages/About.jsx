import React from "react";

export default function About() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-blue-900 dark:text-yellow-400">About Us</h1>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-yellow-300">Who We Are</h2>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">Welcome to MyShopping Center! We are passionate about delivering the best shopping experience with a diverse range of products, unbeatable deals, and top-notch customer service. Based in Nairobi, Kenya, we proudly serve customers nationwide.</p>
      </section>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-yellow-300">Our Mission</h2>
        <p className="text-md text-gray-600 dark:text-gray-300 mb-4">Our mission is to make shopping easy, fun, and accessible for everyone. We strive to bring you the latest products, exclusive promotions, and a seamless online experience from browsing to checkout.</p>
      </section>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-yellow-300">Why Shop With Us?</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 mb-4 space-y-2">
          <li>Wide selection of quality products at competitive prices</li>
          <li>Fast, reliable delivery across Kenya</li>
          <li>Secure payments with multiple options</li>
          <li>Friendly customer support ready to help you</li>
          <li>Exciting events, deals, and loyalty rewards</li>
        </ul>
      </section>
      <section className="max-w-2xl w-full mb-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-yellow-300">Meet Our Team</h2>
        <p className="text-md text-gray-600 dark:text-gray-300 mb-2">Our dedicated team is committed to making your shopping experience amazing. From product experts to support staff, we work together to serve you better every day.</p>
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4 shadow text-center">
            <div className="font-bold text-blue-900 dark:text-yellow-400">Diana N.</div>
            <div className="text-xs text-gray-500">Founder & CEO</div>
          </div>
          <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4 shadow text-center">
            <div className="font-bold text-blue-900 dark:text-yellow-400">Samuel K.</div>
            <div className="text-xs text-gray-500">Head of Operations</div>
          </div>
          <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4 shadow text-center">
            <div className="font-bold text-blue-900 dark:text-yellow-400">Grace M.</div>
            <div className="text-xs text-gray-500">Customer Support Lead</div>
          </div>
        </div>
      </section>
      <section className="max-w-2xl w-full text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Thank you for choosing us as your go-to shopping destination!</p>
      </section>
    </div>
  );
}
