import React, { useEffect } from 'react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to Policy Bhandar. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data when you use the Policy Bhandar iOS App and Website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
            <p>
              We collect information to provide better services to our users. The types of personal information we may collect include:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our App, including pages visited, features used, and time spent.</li>
              <li><strong>Device Information:</strong> We may collect device-specific information such as device model, OS version, and unique device identifiers (in compliance with Apple's App Tracking Transparency framework).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p>
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide, maintain, and improve our App and services.</li>
              <li>To process transactions and manage your active subscriptions.</li>
              <li>To send you important notifications regarding updates, security alerts, and administrative messages.</li>
              <li>To personalize your experience and deliver content relevant to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Retention and Deletion</h2>
            <p>
              We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. 
              <strong> Account Deletion:</strong> You have the right to request the deletion of your account and associated personal data at any time. You can do this directly within the App settings or by contacting us at caykverma@gmail.com. Once requested, your data will be permanently deleted from our servers within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Third-Party Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our App, conducting our business, or servicing you, so long as those parties agree to keep this information confidential and comply with strict data protection standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Children's Privacy</h2>
            <p>
              Our App is not intended for use by children under the age of 13 (or higher age depending on local laws). We do not knowingly collect personal identifiable information from children under 13. If we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us:<br />
              Email: caykverma@gmail.com<br />
              Phone: +91 9818826521
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

