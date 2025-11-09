import Link from 'next/link';
import { Button } from '@bruh/ui';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            BRUH
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Anonymous feedback, truly secure
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            End-to-end encrypted messages. Your identity stays private. 
            Share your unique link and receive honest, anonymous feedback.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16 animate-slide-up">
            <Link href="/auth/login">
              <Button size="lg" variant="primary">
                Get Started
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="secondary">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">End-to-End Encrypted</h3>
              <p className="text-gray-600">
                Messages are encrypted on sender&apos;s device. Not even we can read them.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Blazing Fast</h3>
              <p className="text-gray-600">
                Optimized for speed. Send and receive messages instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Built-in Moderation</h3>
              <p className="text-gray-600">
                Smart filters and custom rules keep your inbox safe.
              </p>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 mb-8">Start free, upgrade when you need more</p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-4xl font-bold text-primary-600 mb-4">₹0</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Receive up to 50 messages
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Send 2 messages
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic moderation
                  </li>
                </ul>
                <Button variant="secondary" className="w-full">Current Plan</Button>
              </div>

              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-8 rounded-xl shadow-lg border-2 border-primary-700">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-4xl font-bold mb-4">$2.99<span className="text-lg">/mo</span></p>
                <p className="text-sm opacity-90 mb-4">Pay with Bitcoin, Ethereum, USDT</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited messages
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom moderation rules
                  </li>
                </ul>
                <Button variant="secondary" className="w-full bg-white text-primary-600 hover:bg-gray-100">
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
