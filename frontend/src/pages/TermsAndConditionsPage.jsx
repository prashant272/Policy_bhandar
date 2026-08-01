import React, { useEffect } from 'react';

export default function TermsAndConditionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Terms and Conditions (EULA)</h1>
        
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acknowledgement</h2>
            <p>
              These Terms and Conditions constitute an End-User License Agreement ("EULA") between you and Policy Bhandar, not with Apple Inc. Policy Bhandar is solely responsible for the Policy Bhandar App (the "App") and its content. By downloading, installing, or using the App, you agree to be bound by these terms. If you do not agree to these terms, do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Scope of License</h2>
            <p>
              Policy Bhandar grants you a non-transferable, non-exclusive, revocable license to use the App on any Apple-branded products that you own or control and as permitted by the Usage Rules set forth in the Apple App Store Terms of Service. This license does not allow you to use the App on any Apple Device that you do not own or control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Maintenance and Support</h2>
            <p>
              Policy Bhandar is solely responsible for providing any maintenance and support services with respect to the App, as specified in this EULA, or as required under applicable law. You and Policy Bhandar acknowledge that Apple has no obligation whatsoever to furnish any maintenance and support services with respect to the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Warranty</h2>
            <p>
              Policy Bhandar is solely responsible for any product warranties, whether express or implied by law, to the extent not effectively disclaimed. In the event of any failure of the App to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price for the App to you; and that, to the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Product Claims</h2>
            <p>
              You and Policy Bhandar acknowledge that Policy Bhandar, not Apple, is responsible for addressing any claims of you or any third party relating to the App or your possession and/or use of the App, including, but not limited to: (i) product liability claims; (ii) any claim that the App fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection, privacy, or similar legislation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Intellectual Property Rights</h2>
            <p>
              You and Policy Bhandar acknowledge that, in the event of any third-party claim that the App or your possession and use of the App infringes that third party’s intellectual property rights, Policy Bhandar, not Apple, will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Legal Compliance</h2>
            <p>
              You represent and warrant that (i) you are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a "terrorist supporting" country; and (ii) you are not listed on any U.S. Government list of prohibited or restricted parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Third-Party Beneficiary</h2>
            <p>
              You and Policy Bhandar acknowledge and agree that Apple, and Apple’s subsidiaries, are third-party beneficiaries of this EULA, and that, upon your acceptance of the terms and conditions of this EULA, Apple will have the right (and will be deemed to have accepted the right) to enforce this EULA against you as a third-party beneficiary thereof.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. User Accounts and Subscriptions</h2>
            <p>
              Certain features of the App may require you to register for an account and purchase subscriptions. All payments will be processed securely. We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact Information</h2>
            <p>
              If you have any questions, complaints, or claims with respect to the App, please contact us at:<br />
              Email: caykverma@gmail.com<br />
              Phone: +91 9818826521<br />
              Address: B1/6 Third Floor B-Block, Back Street, Near KD Grand Banquet Hall, Sewak Park, Kakrola, Delhi 110078
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

