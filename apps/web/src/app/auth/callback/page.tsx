'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { generateKeyPair } from '@bruh/crypto';

export default function InstagramAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error('Failed to get session');
        }

        // Check if user exists in our database
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!existingUser) {
          // Create new user with E2E encryption keys
          const keyPair = await generateKeyPair();
          const username = session.user.user_metadata?.username || session.user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

          await supabase.from('users').insert({
            id: session.user.id,
            username: username,
            email: session.user.email,
            public_key: keyPair.publicKey,
          });

          // Store private key securely (in practice, this would be more sophisticated)
          localStorage.setItem('bruh_private_key', keyPair.privateKey);
        } else {
          // Load existing private key if available
          const storedKey = localStorage.getItem('bruh_private_key');
          if (!storedKey) {
            // Private key lost - would need recovery mechanism in production
            console.warn('Private key not found in localStorage');
          }
        }

        router.push('/dashboard');
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Authentication failed');
      }
    }

    handleAuthCallback();
  }, [router, supabase]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Authentication Failed</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
