const fs = require('fs');
const path = require('path');

const termsContent = `
import React from 'react';

export const metadata = {
  title: 'Terms of Service - AxumMarket',
  description: 'Terms and Conditions for using AxumMarket.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>
      
      <div className="prose prose-green max-w-none space-y-6 text-gray-700">
        <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using AxumMarket, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
          <p>AxumMarket is a digital marketplace that connects livestock sellers with potential buyers in Ethiopia. We do not own, sell, or transport any livestock listed on the platform. We act solely as a classifieds board facilitating communication between independent parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Responsibilities & Conduct</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate, current, and complete information when creating a listing.</li>
            <li>You are strictly prohibited from posting fraudulent listings, stolen property, or illegal items.</li>
            <li>You must have the legal right to sell the livestock and use the images you upload.</li>
            <li>You agree not to use the platform for any unlawful purpose under the laws of the Federal Democratic Republic of Ethiopia.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Disclaimer of Liability & Payments</h2>
          <p>AxumMarket does <strong>NOT</strong> handle payments, escrow, or physical delivery. All transactions, negotiations, and payments occur independently between the buyer and seller off-platform.</p>
          <p>We are not responsible for financial losses, scams, or the health/quality of the livestock purchased. Buyers are strongly advised to inspect livestock in person before making any payment.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Moderation & Account Termination</h2>
          <p>We reserve the right to review, reject, suspend, or delete any listing or user account at our sole discretion if we suspect fraud, abuse, or violation of these terms.</p>
        </section>

      </div>
    </div>
  );
}
`;

const privacyContent = `
import React from 'react';

export const metadata = {
  title: 'Privacy Policy - AxumMarket',
  description: 'Privacy Policy and Data Protection guidelines for AxumMarket.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-green max-w-none space-y-6 text-gray-700">
        <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-sm text-green-800">
            This Privacy Policy complies with the <strong>Personal Data Protection Proclamation No. 1321/2024</strong> of Ethiopia.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p>When you register as a seller or post a listing on AxumMarket, we collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your full name</li>
            <li>Your phone number</li>
            <li>Your location (Region, City, Specific Area)</li>
            <li>Photographs of your livestock</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <p>We collect this information solely to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Display your contact information to potential buyers so they can call you.</li>
            <li>Verify the authenticity of your account to prevent fraud.</li>
            <li>Improve the security and moderation of the marketplace.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h2>
          <p>Your security is our priority. We implement strict technical and organizational measures to protect your personal data against unauthorized access or disclosure.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Passwords are securely encrypted (hashed) using industry-standard cryptography.</li>
            <li>Administrative access to the database is strictly controlled through Role-Based Access Control (RBAC).</li>
            <li>We do not sell, rent, or trade your personal data to third-party marketing companies.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Deletion & Rights</h2>
          <p>Under Ethiopian law, you have the right to request access to, correction of, or deletion of your personal data. If you wish to delete your account or specific listings, please contact our administrative team.</p>
        </section>

      </div>
    </div>
  );
}
`;

fs.mkdirSync(path.join(__dirname, 'apps/web/app/terms'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'apps/web/app/terms/page.tsx'), termsContent);

fs.mkdirSync(path.join(__dirname, 'apps/web/app/privacy'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'apps/web/app/privacy/page.tsx'), privacyContent);

console.log("Pages created successfully.");
