import React from "react";

const faqs = [
  {
    question: "How do I place an order?",
    answer: "Simply browse our products, add items to your cart, and proceed to checkout. Follow the prompts to complete your purchase.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Visa, MasterCard, PayPal, and mobile money payments.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery within Nairobi takes 1-2 days. Other regions may take 2-5 days depending on location.",
  },
  {
    question: "How can I contact support?",
    answer: "You can reach us via the Contact page, email, or phone. We're here to help!",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-900 dark:text-yellow-400">Frequently Asked Questions</h1>
      <div className="max-w-2xl w-full flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4 shadow">
            <h2 className="font-semibold text-lg text-blue-900 dark:text-yellow-300 mb-2">{faq.question}</h2>
            <p className="text-gray-700 dark:text-gray-200">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
