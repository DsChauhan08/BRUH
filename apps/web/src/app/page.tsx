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
                Get Started Free
              </Button>
            </Link>
            <a href="#download">
              <Button size="lg" variant="secondary">
                Download App
              </Button>
            </a>
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
                <p className="text-4xl font-bold mb-4">₹299<span className="text-lg">/mo</span></p>
                <p className="text-sm opacity-90 mb-4">Pay with UPI (Paytm, PhonePe, Google Pay)</p>
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

          {/* Download Section */}
          <div id="download" className="mt-16 bg-white rounded-xl shadow-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Get BRUH on Your Device</h2>
            <p className="text-gray-600 mb-8">Available on web, Android, and iOS (coming soon)</p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {/* Web App */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Web</h3>
                <p className="text-gray-600 mb-4">Use directly in browser</p>
                <Link href="/auth/login">
                  <Button variant="primary" className="w-full">
                    Launch Web App
                  </Button>
                </Link>
              </div>

              {/* Android */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Android</h3>
                <p className="text-gray-600 mb-4">Download APK</p>
                <Button variant="secondary" className="w-full" disabled>
                  Coming Soon
                </Button>
              </div>

              {/* iOS */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">iOS</h3>
                <p className="text-gray-600 mb-4">App Store</p>
                <Button variant="secondary" className="w-full" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                💡 For now, use the web app. It works great on mobile browsers!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
