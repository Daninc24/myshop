import React from 'react';
import { Link } from 'react-router-dom';
import { getBrandName, getBrandEmail } from '../config/branding';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using {getBrandName()}, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials on {getBrandName()}'s website for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You must be at least 18 years old to use this service</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Products and Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All products and services are subject to availability. We reserve the right to discontinue any product or service at any time. 
                Prices for our products are subject to change without notice.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Product descriptions and pricing are subject to change</li>
                <li>We strive to display accurate product information</li>
                <li>Colors and specifications may vary from actual products</li>
                <li>We reserve the right to limit quantities purchased</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payment is due at the time of purchase. We accept various payment methods as displayed during checkout. 
                All transactions are processed securely.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Payment must be received before order processing</li>
                <li>We use secure payment processing systems</li>
                <li>Refunds are subject to our return policy</li>
                <li>Disputed charges should be reported immediately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Shipping and Returns</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We aim to process and ship orders promptly. Return policies vary by product type and are clearly stated at the time of purchase.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Shipping times are estimates and not guaranteed</li>
                <li>Returns must be initiated within 30 days of purchase</li>
                <li>Items must be in original condition for returns</li>
                <li>Return shipping costs may apply</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                to understand our practices.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  View our Privacy Policy →
                </Link>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. 
                You may not violate any international, federal, provincial, or state regulations, rules, or laws.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>No fraudulent or unauthorized transactions</li>
                <li>No harassment or abuse of other users</li>
                <li>No spam or unsolicited communications</li>
                <li>No violation of intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, 
                {getBrandName()} excludes all representations, warranties, conditions and terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In no event shall {getBrandName()} or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use 
                the materials on {getBrandName()}'s website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modifications</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {getBrandName()} may revise these terms of service at any time without notice. By using this website, 
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href={`mailto:${getBrandEmail()}`} className="text-indigo-600 hover:text-indigo-500">{getBrandEmail()}</a>
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Website:</strong> <Link to="/" className="text-indigo-600 hover:text-indigo-500">{getBrandName()}</Link>
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                ← Back to {getBrandName()}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;