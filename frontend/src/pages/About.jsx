import React from "react";

export default function About() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-blue-900 dark:text-yellow-400">About Us</h1>
      <p className="max-w-2xl text-lg text-gray-700 dark:text-gray-200 text-center mb-6">
        Welcome to MyShopping Center! We are passionate about delivering the best shopping experience with a diverse range of products, unbeatable deals, and top-notch customer service. Our mission is to make shopping easy, fun, and accessible for everyone.
      </p>
      <p className="max-w-2xl text-md text-gray-600 dark:text-gray-300 text-center">
        We are based in Nairobi, Kenya, and serve customers nationwide. Thank you for choosing us as your go-to shopping destination!
      </p>
    </div>
  );
}
