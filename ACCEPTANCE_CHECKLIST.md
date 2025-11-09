# BRUH - Acceptance Checklist

Use this checklist to validate that all deliverables are working correctly before considering the MVP complete.

## ✅ Infrastructure & Setup

- [ ] Monorepo structure created with Turborepo + PNPM
- [ ] All packages compile without errors (\`pnpm build\`)
- [ ] ESLint passes on all code (\`pnpm lint\`)
- [ ] TypeScript strict mode enabled and passing
- [ ] Environment variables documented in \`.env.example\`

## ✅ Database & Backend

- [ ] Supabase migration \`001_init.sql\` applied successfully
- [ ] All tables created: \`users\`, \`anonymous_messages\`, \`payments\`, \`reports\`, \`rate_limits\`, \`moderation_rules\`, \`global_blocklist\`
- [ ] RLS policies active and tested
- [ ] Atomic rate limit function \`check_and_increment_rate_limit()\` works
- [ ] Free tier limit functions work: \`can_receive_message()\`, \`increment_message_count()\`

## ✅ Supabase Edge Functions

- [ ] \`sendMessage\` function deployed
  - [ ] Validates all required fields
  - [ ] Enforces rate limits (3 messages per hour per device)
  - [ ] Enforces free sender limit (2 messages total)
  - [ ] Enforces free recipient limit (50 messages)
  - [ ] Stores hashed IP and device fingerprint
  - [ ] Runs moderation checks
  - [ ] Inserts message with correct status
- [ ] \`paypalWebhook\` function deployed
  - [ ] Verifies PayPal webhook signature
  - [ ] Creates payment records
  - [ ] Updates user subscription status
- [ ] \`upiWebhook\` function deployed
  - [ ] Verifies Razorpay signature
  - [ ] Handles payment success events
  - [ ] Updates user subscription
- [ ] \`moderationWorker\` function deployed
  - [ ] Re-scans messages on demand
  - [ ] Batch processes unmoderated messages

## ✅ End-to-End Encryption

- [ ] \`@bruh/crypto\` package builds successfully
- [ ] \`generateKeyPair()\` creates valid key pairs
- [ ] \`encryptMessage()\` produces ciphertext + nonce
- [ ] \`decryptMessage()\` correctly decrypts with recipient's private key
- [ ] Server never sees plaintext (verified in network logs)
- [ ] Private keys stored only in localStorage

## ✅ Frontend - Public Message Composer

- [ ] Route \`/u/[username]\` accessible
- [ ] Fetches recipient public key from API
- [ ] Displays form to write message
- [ ] Collects device fingerprint (userAgent, platform, language, etc.)
- [ ] Encrypts message client-side before sending
- [ ] Shows success message after send
- [ ] Shows appropriate error messages (user not found, rate limit, etc.)
- [ ] Character counter works (max 1000 chars)
- [ ] Mobile responsive

## ✅ Frontend - Authentication

- [ ] \`/auth/login\` page displays Instagram login button
- [ ] OAuth flow redirects to \`/auth/callback\`
- [ ] New users created in database with encryption keys
- [ ] Private key stored in localStorage
- [ ] Redirects to \`/dashboard\` after successful auth
- [ ] Handles auth errors gracefully

## ✅ Frontend - Recipient Dashboard

- [ ] \`/dashboard\` requires authentication
- [ ] Displays shareable link prominently
- [ ] Copy link button works
- [ ] Shows message count and tier (free/pro)
- [ ] Lists all received messages
- [ ] Decrypts messages using private key
- [ ] Shows message status badges (visible, quarantined, etc.)
- [ ] Shows timestamp for each message
- [ ] Displays stats: total messages, new today, remaining (free tier)
- [ ] Logout button works

## ✅ Payments - PayPal

- [ ] \`/api/payments/paypal/create-subscription\` endpoint works
- [ ] Returns approval URL
- [ ] Webhook endpoint verifies signature
- [ ] Subscription activation updates \`users.is_paid\`
- [ ] Payment record created in \`payments\` table
- [ ] Cancellation/expiry handled correctly
- [ ] Tested with PayPal sandbox

## ✅ Payments - UPI (Razorpay)

- [ ] \`/api/payments/upi/create-order\` endpoint works
- [ ] Returns Razorpay order ID and key
- [ ] Webhook verifies signature
- [ ] Payment success updates user subscription
- [ ] Payment record created
- [ ] Tested with Razorpay test mode

## ✅ Rate Limiting

- [ ] Sending 3 messages to same recipient blocks 4th (per hour)
- [ ] Free sender blocked after 2 total messages
- [ ] Free recipient stops receiving after 50 messages
- [ ] Error messages clear and actionable
- [ ] Rate limits reset after time window

## ✅ Moderation

- [ ] Global blocklist keywords reject messages
- [ ] Quarantined messages marked correctly
- [ ] Moderation score calculated
- [ ] Admin can re-run moderation on messages
- [ ] Recipients can report messages

## ✅ Testing

- [ ] Jest unit tests pass (\`pnpm test\`)
- [ ] Playwright E2E tests configured
- [ ] Homepage test passes
- [ ] Send message flow test (with test user)
- [ ] Login flow test
- [ ] CI pipeline runs tests automatically

## ✅ CI/CD

- [ ] GitHub Actions workflow file created
- [ ] Lint job passes
- [ ] Test job passes
- [ ] Docker image builds successfully
- [ ] Image pushed to GitHub Container Registry
- [ ] Deployment step documented (even if manual)

## ✅ Docker & Deployment

- [ ] Dockerfile builds without errors
- [ ] \`docker-compose.yml\` configured
- [ ] Container runs and serves app on port 3000
- [ ] Environment variables passed correctly
- [ ] Health check confirms app is responsive

## ✅ Documentation

- [ ] README.md complete with:
  - [ ] Installation steps
  - [ ] Environment variable documentation
  - [ ] Supabase setup instructions
  - [ ] Edge Function deployment steps
  - [ ] Webhook configuration
  - [ ] Docker deployment commands
  - [ ] Testing instructions
  - [ ] Troubleshooting section
- [ ] \`.env.example\` has all required variables
- [ ] Code comments on complex logic
- [ ] This acceptance checklist ✓

## ✅ Legal & Policy

- [ ] Refund policy page exists (\`/legal/refund-policy\`)
- [ ] Displays "No refunds" policy at checkout
- [ ] Terms of service page (\`/legal/terms\`)
- [ ] Privacy policy page (\`/legal/privacy\`)

## ✅ Performance & UX

- [ ] Homepage loads in < 2 seconds
- [ ] Message send completes in < 1 second
- [ ] Dashboard loads messages in < 2 seconds
- [ ] Mobile responsive (tested on iOS and Android simulators)
- [ ] No console errors in production build
- [ ] Animations smooth (fade-in, slide-up)

## ✅ Security Audit

- [ ] No secrets in client code
- [ ] Service role key only in server functions
- [ ] Webhook signatures verified
- [ ] RLS policies prevent unauthorized access
- [ ] Rate limits enforced atomically
- [ ] IP addresses hashed with salt
- [ ] Device fingerprints hashed before storage
- [ ] SQL injection protected (parameterized queries)
- [ ] XSS protected (React escapes by default)

---

## Final Sign-Off

**Date Completed:** _____________

**Tested By:** _____________

**Production URL:** _____________

**Notes:**

- All features working as specified
- Ready for soft launch
- Monitoring and alerting configured
- Backup plan documented
- Rollback procedure tested

**Approved for Production:** ☐ Yes ☐ No
