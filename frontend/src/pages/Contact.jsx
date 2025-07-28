import React from "react";

export default function Contact() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-blue-900 dark:text-yellow-400">Contact</h1>
      <p className="max-w-xl text-lg text-gray-700 dark:text-gray-200 text-center mb-6">
        We'd love to hear from you! Reach out with any questions, feedback, or support needs.
      </p>
      <div className="max-w-lg w-full flex flex-col gap-4 bg-blue-50 dark:bg-gray-800 p-6 rounded-xl shadow">
        <div className="flex items-center gap-2">
          <span className="font-bold">Phone:</span>
          <a href="tel:+254700000000" className="text-primary hover:underline">+254 700 000 000</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Email:</span>
          <a href="mailto:info@myshoppingcenter.com" className="text-primary hover:underline">info@myshoppingcenter.com</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Location:</span>
          <span>Nairobi, Kenya</span>
        </div>
      </div>
    </div>
  );
}
