export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund Policy</h1>
        
        <div className="prose prose-gray">
          <p className="text-gray-600 mb-4">
            <strong>Effective Date:</strong> November 8, 2025
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">No Refunds</h2>
          <p className="mb-4">
            All purchases and subscriptions on BRUH are final and non-refundable. 
            By subscribing to a paid plan, you acknowledge and agree that:
          </p>

          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>All payments are final and cannot be refunded</li>
            <li>Subscriptions cannot be canceled for a refund</li>
            <li>No partial refunds are provided for unused time</li>
            <li>Downgrades do not result in refunds or credits</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Subscription Cancellation</h2>
          <p className="mb-4">
            While we do not offer refunds, you may cancel your subscription at any time. 
            Upon cancellation:
          </p>

          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>You retain access until the end of your current billing period</li>
            <li>No further charges will be made</li>
            <li>Your account will revert to the free tier after expiration</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Exceptions</h2>
          <p className="mb-4">
            The only exceptions to this policy are:
          </p>

          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Charges made in error due to technical issues (subject to verification)</li>
            <li>Duplicate charges for the same subscription period</li>
            <li>Cases required by applicable law</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">Contact</h2>
          <p className="mb-4">
            If you believe you have been charged in error, please contact us immediately at:
          </p>
          <p className="mb-4">
            <strong>Email:</strong> support@bruh.ngl.app
          </p>

          <p className="text-sm text-gray-500 mt-8">
            By using BRUH and making a purchase, you acknowledge that you have read and agree to this refund policy.
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
