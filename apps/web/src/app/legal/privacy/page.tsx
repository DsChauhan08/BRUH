export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-gray">
          <p className="text-gray-600 mb-4">
            <strong>Last Updated:</strong> November 8, 2025
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Data We Collect</h2>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">Authentication Data</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Instagram username and email (via OAuth)</li>
            <li>Public encryption key (generated on your device)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">Message Data</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Encrypted message content (we cannot decrypt this)</li>
            <li>Message metadata (timestamp, sender device hash, hashed IP)</li>
            <li>Device fingerprint hash (for abuse prevention)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">Payment Data</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Payment provider transaction IDs</li>
            <li>Subscription status and expiration dates</li>
            <li>We do NOT store credit card numbers</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Data</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Deliver messages to recipients</li>
            <li>Prevent abuse and enforce rate limits</li>
            <li>Process payments and manage subscriptions</li>
            <li>Improve service quality and performance</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. End-to-End Encryption</h2>
          <p className="mb-4">
            All message content is encrypted on the sender&apos;s device using your public key. 
            Only you (the recipient) can decrypt messages using your private key, which never 
            leaves your device. We have zero knowledge of message content.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Data Sharing</h2>
          <p className="mb-4">
            We do NOT sell your data. We share data only with:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Payment processors (PayPal, Razorpay) for transactions</li>
            <li>Cloud infrastructure providers (Supabase) for hosting</li>
            <li>Law enforcement if legally required</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access your personal data</li>
            <li>Request deletion of your account</li>
            <li>Export your data</li>
            <li>Opt out of non-essential analytics</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Data Retention</h2>
          <p className="mb-4">
            Messages are stored until deleted by recipient. Account data retained until account deletion. 
            Payment records retained for tax/legal compliance (7 years).
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">7. Security</h2>
          <p className="mb-4">
            We use industry-standard security measures including encryption, hashing, and secure authentication. 
            However, no system is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">8. Contact</h2>
          <p className="mb-4">
            For privacy concerns, contact: privacy@bruh.ngl.app
          </p>
        </div>

        <div className="mt-8 pt-6 border-t">
          <a href="/" className="text-primary-600 hover:underline">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
