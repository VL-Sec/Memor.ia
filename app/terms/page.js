export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#007AFF] to-[#00D4FF] bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <div className="space-y-6 text-[#8E8E93]">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Memor.ia ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              Memor.ia provides a link and snippet management platform that allows users to organize, 
              store, and access their saved content across devices. The Service includes features such as 
              folder organization, tagging, favorites, and reminders.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Account</h2>
            <p className="mb-3">
              To use certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. User Content</h2>
            <p className="mb-3">
              You retain all rights to the content you save in Memor.ia. By using the Service, you grant us 
              a license to store and process your content to provide the Service. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensuring you have the right to save and share content</li>
              <li>Not violating any intellectual property rights</li>
              <li>Not storing illegal or harmful content</li>
              <li>Backing up your important data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Prohibited Uses</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Transmit viruses or malicious code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Scrape or copy content without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Subscription and Payments</h2>
            <p className="mb-3">
              Memor.ia offers both free and paid subscription plans:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Free Plan:</strong> Limited features as described in the app</li>
              <li><strong>Pro Plan:</strong> Unlimited features with monthly/annual billing</li>
              <li>Payments are processed securely through our payment provider</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are handled according to our refund policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms. 
              You may cancel your account at any time through the app settings. Upon termination, 
              your data may be deleted according to our data retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that 
              the Service will be uninterrupted, secure, or error-free. You use the Service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Memor.ia shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use or inability 
              to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant 
              changes via email or in-app notification. Continued use of the Service after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Portugal, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact</h2>
            <p>
              For questions about these Terms, please contact us at: <br />
              <a href="mailto:support@memoria.app" className="text-[#007AFF] hover:underline">
                support@memoria.app
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-[#2C2C2E] text-sm">
            <p>Last updated: June 2025</p>
            <p className="mt-2">Version 1.0</p>
          </div>
        </div>

        <div className="mt-8">
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-[#007AFF] hover:bg-[#0051D5] rounded-2xl transition-all"
          >
            Back to App
          </a>
        </div>
      </div>
    </div>
  )
}
