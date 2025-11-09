export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-gray">
          <p className="text-gray-600 mb-4">
            <strong>Last Updated:</strong> November 8, 2025
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using BRUH, you accept and agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. Service Description</h2>
          <p className="mb-4">
            BRUH is an anonymous feedback platform that allows users to send and receive messages with end-to-end encryption.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. User Conduct</h2>
          <p className="mb-4">You agree NOT to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Send messages containing harassment, threats, or hate speech</li>
            <li>Abuse the anonymity feature to harm others</li>
            <li>Attempt to circumvent rate limits or security measures</li>
            <li>Use automated systems to send messages</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Account Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Privacy & Encryption</h2>
          <p className="mb-4">
            Messages are end-to-end encrypted. We cannot read your messages. However, we collect 
            device fingerprints and hashed IP addresses for abuse prevention.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">
            BRUH is provided &quot;as is&quot; without warranties. We are not liable for user-generated content 
            or any damages arising from use of the service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">7. Changes to Terms</h2>
          <p className="mb-4">
            We may update these terms at any time. Continued use constitutes acceptance of changes.
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
