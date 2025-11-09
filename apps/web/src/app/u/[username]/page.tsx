'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@bruh/ui';
import { encryptMessage } from '@bruh/crypto';

interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution?: string;
  timezone?: string;
  canvas?: string;
  webgl?: string;
}

function collectDeviceFingerprint(): DeviceFingerprint {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export default function SendMessagePage() {
  const params = useParams();
  const username = params?.username as string;

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [recipientExists, setRecipientExists] = useState(false);

  useEffect(() => {
    async function fetchRecipient() {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          setRecipientPublicKey(data.publicKey);
          setRecipientExists(true);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to load user');
      }
    }

    if (username) {
      fetchRecipient();
    }
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!recipientPublicKey) {
        throw new Error('Recipient public key not loaded');
      }

      // Encrypt message on client
      const encrypted = await encryptMessage(message, recipientPublicKey);
      const deviceFingerprint = collectDeviceFingerprint();

      // Send to edge function
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          recipientUsername: username,
          contentCiphertext: encrypted.ciphertext,
          contentNonce: encrypted.nonce,
          senderPublicKey: encrypted.senderPublicKey,
          deviceFingerprint,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  if (!recipientExists && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Send anonymous message to @{username}
          </h1>
          <p className="text-gray-600">
            Your message will be end-to-end encrypted. Only @{username} can read it.
          </p>
        </div>

        {error && !recipientExists && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {recipientExists && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your anonymous message
                </label>
                <textarea
                  id="message"
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Write your message here... Be kind!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={1000}
                  disabled={loading}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {message.length}/1000
                </div>
              </div>

              {error && recipientExists && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                  Message sent successfully! 🎉
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  End-to-end encrypted
                </div>
                <Button
                  type="submit"
                  disabled={loading || !message.trim()}
                  size="lg"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">🔒 Your Privacy</h3>
            <p className="text-sm text-primary-800">
              Messages are encrypted on your device before sending. Your identity is never revealed.
            </p>
          </div>
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">📝 Be Respectful</h3>
            <p className="text-sm text-primary-800">
              Harmful content is filtered. Abuse may result in your device being blocked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
