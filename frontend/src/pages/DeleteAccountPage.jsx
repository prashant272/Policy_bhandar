import React from 'react';

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-32 pb-20">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-premium p-8 text-center">
          <h1 className="text-3xl font-black text-white mb-2">Account Deletion Request</h1>
          <p className="text-orange-100 font-medium text-sm">
            Learn how to delete your Policy Bhandar account and associated data.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Method 1: In App */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">1</span>
              Delete from within the App (Recommended)
            </h2>
            <div className="pl-10 space-y-3 text-slate-600">
              <p>The fastest way to delete your account is directly from the Policy Bhandar app.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Open the Policy Bhandar app and log in to your account.</li>
                <li>Click on your <strong>Profile Photo</strong> or the <strong>Profile Icon</strong> to open your Profile.</li>
                <li>Scroll to the very bottom of the profile section.</li>
                <li>Click on the red <strong>Delete Account</strong> button.</li>
                <li>Confirm your choice when prompted.</li>
              </ul>
              <p className="text-sm bg-blue-50 text-blue-700 p-3 rounded-xl mt-4">
                <strong>Note:</strong> Once you confirm, your account and all associated data (name, mobile, photos, plan details) will be permanently deleted from our servers immediately. This action cannot be undone.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Method 2: Via Email */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">2</span>
              Request Deletion via Email
            </h2>
            <div className="pl-10 space-y-3 text-slate-600">
              <p>If you no longer have access to the app, you can request account deletion by emailing our support team.</p>
              
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mt-4">
                <p className="mb-2">Send an email to:</p>
                <a href="mailto:support@policybhandar.com" className="text-lg font-bold text-orange-600 hover:text-orange-700 underline">support@policybhandar.com</a>
                
                <p className="mt-4 mb-2 font-semibold">Please include:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Your full name registered on the app.</li>
                  <li>Your registered mobile number.</li>
                  <li>A brief statement that you want your account and data deleted.</li>
                </ul>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                We will process email deletion requests within 3-5 business days and confirm once your data is permanently removed.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
