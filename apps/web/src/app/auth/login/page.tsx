'use client';

import { Button } from '@bruh/ui';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'magic-link' | 'signup'>('magic-link');
  const [success, setSuccess] = useState('');

  async function handleMagicLinkLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setSuccess('Check your email for the login link!');
    } catch (err: any) {
      setError(err.message || 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Generate username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      const { error } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-8), // Random password, user will use magic link
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
          },
        },
      });

      if (error) throw error;
      setSuccess('Check your email to confirm your account!');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">BRUH</h1>
          <p className="text-gray-600">Login to manage your anonymous messages</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('magic-link')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'magic-link'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Magic Link
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={mode === 'magic-link' ? handleMagicLinkLogin : handleEmailSignup}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full"
              size="lg"
            >
              {loading
                ? 'Sending...'
                : mode === 'magic-link'
                ? 'Send Magic Link'
                : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-sm text-gray-600 text-center">
            <p className="mb-2">
              {mode === 'magic-link'
                ? "We'll email you a login link - no password needed!"
                : 'A username will be auto-generated from your email'}
            </p>
            <p>
              By continuing, you agree to our{' '}
              <a href="/legal/terms" className="text-primary-600 hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/legal/privacy" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
