export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#007AFF] to-[#00D4FF] bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-[#8E8E93]">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Memor.ia ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              application and services. This policy complies with GDPR and other applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Email address, name, profile picture (from OAuth providers)</li>
              <li><strong>Content:</strong> Links, notes, snippets, tags, and folders you create</li>
              <li><strong>Payment Information:</strong> Processed securely by our payment provider (we don't store card details)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Features used, actions taken, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use collected information for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing and maintaining the Service</li>
              <li>Processing your transactions and subscriptions</li>
              <li>Sending you notifications and reminders (if enabled)</li>
              <li>Improving and personalizing your experience</li>
              <li>Detecting and preventing fraud or abuse</li>
              <li>Complying with legal obligations</li>
              <li>Communicating updates and important information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="mb-3">We process your data based on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contract:</strong> To provide services you've requested</li>
              <li><strong>Consent:</strong> For marketing communications and optional features</li>
              <li><strong>Legitimate Interest:</strong> To improve our service and prevent fraud</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Storage and Security</h2>
            <p className="mb-3">
              Your data is stored securely using Supabase infrastructure:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Data is encrypted in transit (HTTPS) and at rest</li>
              <li>Servers are located in secure data centers</li>
              <li>Access is restricted to authorized personnel only</li>
              <li>Regular security audits and updates</li>
              <li>Backups are performed automatically</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Sharing and Disclosure</h2>
            <p className="mb-3">We do not sell your personal data. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Supabase (hosting), payment processors</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
              <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
            </ul>
            <p className="mt-3">
              All third-party providers are contractually obligated to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights (GDPR)</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Delete your account and data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Object:</strong> Object to processing for certain purposes</li>
              <li><strong>Withdraw Consent:</strong> At any time for consent-based processing</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, use the "Delete All Data" option in Settings or contact us at 
              <a href="mailto:privacy@memoria.app" className="text-[#007AFF] hover:underline ml-1">
                privacy@memoria.app
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide services. 
              When you delete your account, we delete your personal data within 30 days, except where 
              retention is required by law. Backups are automatically purged within 90 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
            <p className="mb-3">
              We use essential cookies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain your login session</li>
              <li>Remember your preferences (language, settings)</li>
              <li>Analyze usage patterns (anonymized)</li>
            </ul>
            <p className="mt-3">
              You can control cookies through your browser settings. Disabling cookies may limit functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside the EU. We ensure 
              appropriate safeguards are in place, including standard contractual clauses approved by 
              the European Commission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Children's Privacy</h2>
            <p>
              Memor.ia is not intended for children under 16. We do not knowingly collect personal 
              information from children. If you believe we have collected data from a child, please 
              contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes 
              via email or in-app notification. The "Last Updated" date at the bottom indicates the 
              latest revision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact & Data Protection Officer</h2>
            <p className="mb-3">
              For privacy concerns or to exercise your rights:
            </p>
            <p>
              Email: <a href="mailto:privacy@memoria.app" className="text-[#007AFF] hover:underline">privacy@memoria.app</a><br />
              Data Protection Officer: <a href="mailto:dpo@memoria.app" className="text-[#007AFF] hover:underline">dpo@memoria.app</a>
            </p>
            <p className="mt-3">
              If you're not satisfied with our response, you have the right to lodge a complaint with 
              your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. California Privacy Rights (CCPA)</h2>
            <p className="mb-3">
              California residents have additional rights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold (we don't sell data)</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale (not applicable)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t border-[#2C2C2E] text-sm">
            <p>Last updated: June 2025</p>
            <p className="mt-2">Version 1.0</p>
            <p className="mt-2">Effective Date: June 2025</p>
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
