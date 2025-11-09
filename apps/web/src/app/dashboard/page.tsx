'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@bruh/ui';
import { decryptMessage } from '@bruh/crypto';

interface Message {
  id: string;
  content_ciphertext: string;
  content_nonce: string;
  sender_public_key: string;
  status: string;
  created_at: string;
  decrypted?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareableLink, setShareableLink] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Get user data
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(userData);
        setUser(userData);
        setShareableLink(`${window.location.origin}/u/${userData.username}`);

        // Get private key from local storage
        const storedPrivateKey = localStorage.getItem('bruh_private_key');
        // Load messages
        const { data: messagesData } = await supabase
          .from('anonymous_messages')
          .select('*')
          .eq('recipient_user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (messagesData) {
          // Decrypt messages
          const decrypted = await Promise.all(
            messagesData.map(async (msg) => {
              try {
                if (storedPrivateKey) {
                  const content = await decryptMessage(
                    {
                      ciphertext: msg.content_ciphertext,
                      nonce: msg.content_nonce,
                      senderPublicKey: msg.sender_public_key,
                    },
                    storedPrivateKey
                  );
                  return { ...msg, decrypted: content };
                }
                return msg;
              } catch (err) {
                console.error('Decryption error:', err);
                return { ...msg, decrypted: '[Failed to decrypt]' };
              }
            })
          );
          setMessages(decrypted);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  function copyLink() {
    navigator.clipboard.writeText(shareableLink);
    alert('Link copied to clipboard!');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BRUH Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">@{user?.username}</span>
            {!user?.is_paid && (
              <Button size="sm" variant="primary" onClick={() => router.push('/upgrade')}>
                Upgrade
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Shareable Link Card */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Your Shareable Link</h2>
          <p className="mb-4 opacity-90">Share this link to receive anonymous messages</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareableLink}
              readOnly
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <Button onClick={copyLink} variant="secondary">
              Copy
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-600 text-sm mb-1">Total Messages</h3>
            <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
            {!user?.is_paid && (
              <p className="text-sm text-gray-500 mt-1">
                {50 - messages.length} remaining on free tier
              </p>
            )}
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-600 text-sm mb-1">Subscription</h3>
            <p className="text-3xl font-bold text-gray-900">
              {user?.is_paid ? 'Pro' : 'Free'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-600 text-sm mb-1">New Today</h3>
            <p className="text-3xl font-bold text-gray-900">
              {messages.filter(m => 
                new Date(m.created_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="divide-y">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No messages yet. Share your link to get started!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      message.status === 'visible' ? 'bg-green-100 text-green-800' :
                      message.status === 'quarantined' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {message.decrypted || '[Encrypted - Key unavailable]'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
