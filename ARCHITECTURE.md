# BRUH - System Architecture

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BRUH Architecture                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐                                      ┌──────────────┐
│   Anonymous  │─────── HTTPS ─────────────────────→ │  Next.js 14  │
│    Sender    │  /u/[username]                       │   Frontend   │
│ (No Login)   │                                      │  (Vercel)    │
└──────────────┘                                      └──────┬───────┘
                                                              │
                    ┌─────────────────────────────────────────┤
                    │                                         │
                    ▼                                         ▼
         ┌──────────────────┐                     ┌──────────────────┐
         │  Client-Side E2E  │                     │  Recipient Auth  │
         │   Encryption      │                     │ (Instagram OAuth)│
         │  (libsodium)      │                     │                  │
         │                   │                     │  Generate Keys   │
         │  1. Get recipient │                     │  Store Private   │
         │     public key    │                     │  Key (localStorage)
         │  2. Encrypt msg   │                     └──────────────────┘
         │  3. Send ciphertext│
         └──────┬────────────┘
                │
                │ POST /functions/v1/sendMessage
                │ {ciphertext, nonce, deviceFingerprint}
                ▼
    ┌───────────────────────────────────────────┐
    │      Supabase Edge Functions (Deno)       │
    │                                           │
    │  ┌──────────────────────────────────┐    │
    │  │   sendMessage Function            │    │
    │  │                                   │    │
    │  │  1. Validate input                │    │
    │  │  2. Check rate limits (atomic)    │    │
    │  │  3. Enforce free tier limits      │    │
    │  │  4. Hash IP + device fingerprint  │    │
    │  │  5. Run moderation checks         │    │
    │  │  6. Insert encrypted message      │    │
    │  │  7. Trigger notification          │    │
    │  └──────────────────────────────────┘    │
    │                                           │
    └───────────────┬───────────────────────────┘
                    │
                    │ Store ciphertext only
                    ▼
       ┌────────────────────────────────────┐
       │      PostgreSQL Database           │
       │          (Supabase)                │
       │                                    │
       │  ┌──────────────────────────┐     │
       │  │ anonymous_messages        │     │
       │  │ ├─ content_ciphertext     │     │
       │  │ ├─ content_nonce          │     │
       │  │ ├─ sender_public_key      │     │
       │  │ ├─ sender_device_hash     │     │
       │  │ ├─ sender_ip_hash         │     │
       │  │ ├─ status (visible/etc)   │     │
       │  │ └─ recipient_user_id      │     │
       │  └──────────────────────────┘     │
       │                                    │
       │  ┌──────────────────────────┐     │
       │  │ rate_limits (atomic)      │     │
       │  │ ├─ identifier             │     │
       │  │ ├─ resource               │     │
       │  │ ├─ count                  │     │
       │  │ └─ window_end             │     │
       │  └──────────────────────────┘     │
       │                                    │
       │  Row-Level Security (RLS) ✓       │
       │  Atomic Operations ✓              │
       └────────────────────────────────────┘
                    │
                    │ Recipient fetches messages
                    ▼
       ┌────────────────────────────────────┐
       │    Recipient Dashboard              │
       │    (Authenticated User)             │
       │                                     │
       │  1. Fetch encrypted messages        │
       │  2. Decrypt with private key        │
       │     (client-side only)              │
       │  3. Display plaintext messages      │
       │                                     │
       │  Server never sees plaintext ✓      │
       └─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     Payment Flow (Separate)                          │
└─────────────────────────────────────────────────────────────────────┘

    Recipient wants to upgrade
            │
            ▼
    ┌────────────────┐          ┌─────────────────┐
    │  Choose Plan   │───────→  │ PayPal / UPI    │
    │  (₹99/mo)      │          │ Payment Gateway │
    └────────────────┘          └────────┬────────┘
                                         │
                                Webhook fires
                                         │
                                         ▼
                         ┌──────────────────────────────┐
                         │ paypalWebhook / upiWebhook   │
                         │ Edge Function                │
                         │                              │
                         │ 1. Verify signature          │
                         │ 2. Update payments table     │
                         │ 3. Set user.is_paid = true   │
                         └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     Key Security Features                            │
└─────────────────────────────────────────────────────────────────────┘

✓ End-to-End Encryption (Zero-Knowledge)
  - Messages encrypted client-side
  - Server stores only ciphertext
  - Private keys never leave user's device

✓ Atomic Rate Limiting
  - PostgreSQL INSERT ON CONFLICT
  - No race conditions
  - Per-device, per-recipient tracking

✓ Hashed Identifiers
  - IP addresses: SHA256(ip + salt)
  - Device fingerprints: SHA256(device_json)
  - Salts stored server-side only

✓ Row-Level Security (RLS)
  - Users can only read their own messages
  - Service role for Edge Functions
  - Public insert via Edge Function only

✓ Webhook Verification
  - PayPal signature verification
  - Razorpay HMAC verification
  - Prevents unauthorized payment updates

┌─────────────────────────────────────────────────────────────────────┐
│                     Deployment Architecture                          │
└─────────────────────────────────────────────────────────────────────┘

GitHub Repository
        │
        │ Push to main
        ▼
┌──────────────────┐
│ GitHub Actions   │  CI/CD Pipeline
│                  │
│ 1. Lint & Test   │
│ 2. Build Docker  │
│ 3. Push to GHCR  │
│ 4. Deploy        │
└──────┬───────────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌──────────────┐              ┌─────────────────────┐
│   Vercel     │              │  Docker Host        │
│  (Next.js)   │              │  (VPS/Cloud)        │
│              │              │                     │
│ • Auto-scale │              │  docker-compose     │
│ • Edge CDN   │              │  • Web container    │
│ • SSL auto   │              │  • Nginx (reverse)  │
└──────────────┘              └─────────────────────┘
       │                                  │
       └──────────┬───────────────────────┘
                  │
                  │ Both connect to
                  ▼
        ┌──────────────────┐
        │    Supabase      │
        │  (Managed PG +   │
        │  Edge Functions) │
        └──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     Data Flow Summary                                │
└─────────────────────────────────────────────────────────────────────┘

Anonymous Sender          Recipient
      │                       │
      │ 1. Encrypt message    │ 4. Fetch encrypted
      │    (client-side)      │    messages
      │                       │
      ├──► 2. Send ciphertext │
      │         │              │
      │         ▼              │
      │    Edge Function       │
      │    (rate limit,        │
      │     moderation)        │
      │         │              │
      │         ▼              │
      │    3. Store in DB      │
      │                        │
      │                        │◄──┤
      │                        │
      │                        │ 5. Decrypt
      │                        │    (client-side)
      │                        │
      │                        ├──► Display plaintext
      │                        │
      
Server never sees plaintext at any stage ✓

┌─────────────────────────────────────────────────────────────────────┐
│                     Technology Matrix                                │
└─────────────────────────────────────────────────────────────────────┘

Layer              Technology           Purpose
─────────────────────────────────────────────────────────────────────
Frontend           Next.js 14           SSR/SSG React framework
                   TypeScript           Type safety
                   Tailwind CSS         Styling
                   libsodium            Encryption

Backend            Supabase Edge Fn     Serverless functions
                   PostgreSQL           Database
                   RLS                  Row-level security

Auth               Instagram OAuth      User authentication
                   JWT                  Session management

Payments           PayPal REST v2       Subscriptions
                   Razorpay            UPI payments

Infrastructure     Docker               Containerization
                   GitHub Actions       CI/CD
                   Vercel              Hosting (alt)

Monitoring         Supabase Logs       Function/DB logs
                   (Optional) Sentry    Error tracking

Testing            Playwright          E2E testing
                   Jest                Unit testing
