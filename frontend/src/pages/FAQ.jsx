import React from "react";

const faqs = [
  // Ordering
  {
    section: "Ordering",
    question: "How do I place an order?",
    answer: "Simply browse our products, add items to your cart, and proceed to checkout. Follow the prompts to complete your purchase.",
  },
  {
    section: "Ordering",
    question: "Can I change or cancel my order?",
    answer: "Please contact us as soon as possible after placing your order. We’ll do our best to accommodate changes or cancellations if your order hasn’t shipped yet.",
  },
  // Payments
  {
    section: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept Visa, MasterCard, PayPal, and mobile money payments.",
  },
  {
    section: "Payments",
    question: "Is it safe to shop on your website?",
    answer: "Absolutely! Our site uses secure SSL encryption and we never store your payment details.",
  },
  // Delivery
  {
    section: "Delivery",
    question: "How long does delivery take?",
    answer: "We offer lightning-fast 24-hour delivery across Kenya! Orders placed before 2 PM are delivered the next day. Express delivery available for urgent orders.",
  },
  {
    section: "Delivery",
    question: "Can I track my order?",
    answer: "Yes! Once your order ships, you’ll receive a tracking link via email or SMS.",
  },
  // Support
  {
    section: "Support",
    question: "How can I contact support?",
    answer: "You can reach us via the Contact page, email, or phone. We're here to help!",
  },
  {
    section: "Support",
    question: "What if I receive a damaged or wrong item?",
    answer: "Contact us immediately with your order number and a photo of the item. We’ll resolve the issue as quickly as possible.",
  },
];

export default function FAQ() {
  // Group FAQs by section
  const sections = ["Ordering", "Payments", "Delivery", "Support"];
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 bg-background transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-text-primary">Frequently Asked Questions</h1>
      <div className="max-w-2xl w-full flex flex-col gap-8">
        {sections.map(section => (
          <div key={section}>
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">{section}</h2>
            <div className="flex flex-col gap-4">
              {faqs.filter(faq => faq.section === section).map((faq, i) => (
                <div key={faq.question} className="bg-surface rounded-xl p-4 shadow">
                  <h3 className="font-semibold text-lg text-text-primary mb-2">{faq.question}</h3>
                  <p className="text-text-primary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-2xl w-full mt-8 text-center">
        <p className="text-md text-text-secondary">Still have questions? <a href="/contact" className="text-primary underline">Contact our support team</a> and we'll be happy to help!</p>
      </div>
    </div>
  );
}
