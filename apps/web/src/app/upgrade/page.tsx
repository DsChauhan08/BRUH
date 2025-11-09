'use client';

import { useState } from 'react';
import { Button } from '@bruh/ui';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  async function handleUPIPayment() {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/login';
        return;
      }

      // Create UPI payment order
      const res = await fetch('/api/payments/upi/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          plan: 'pro',
          amount: 299, // ₹299
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Redirect to Paytm payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Upgrade to Pro</h1>
          <p className="text-xl text-gray-600">
            Pay with UPI - instant activation!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-xl shadow border-2 border-gray-200">
            <h2 className="text-2xl font-bold mb-2">Free</h2>
            <p className="text-4xl font-bold text-gray-400 mb-6">$0</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                50 messages received
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                2 messages sent
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic moderation
              </li>
            </ul>
            <Button variant="secondary" className="w-full" disabled>
              Current Plan
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-8 rounded-xl shadow-lg border-2 border-primary-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Pro</h2>
              <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-bold">
                POPULAR
              </span>
            </div>
            <p className="text-4xl font-bold mb-2">₹299<span className="text-lg">/month</span></p>
            <p className="text-sm opacity-90 mb-6">~$3.50 USD | Pay via UPI</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited messages
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom moderation
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No ads
              </li>
            </ul>
          </div>
        </div>

        {/* UPI Payment Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Pay with UPI</h3>
          
          <div className="flex justify-center items-center mb-8">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">UPI</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-indigo-600">₹</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Paytm</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleUPIPayment}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? 'Creating Payment...' : 'Pay ₹299 with UPI'}
          </Button>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">✓ Instant activation after payment</p>
            <p className="mb-2">✓ Secure payment via Paytm</p>
            <p className="mb-2">✓ Supports all UPI apps (PhonePe, Google Pay, etc.)</p>
            <p className="text-xs text-gray-500 mt-4">
              By upgrading, you agree to our{' '}
              <a href="/legal/terms" className="text-primary-600 hover:underline">Terms</a> and{' '}
              <a href="/legal/refund-policy" className="text-primary-600 hover:underline">No Refund Policy</a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
