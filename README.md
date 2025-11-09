# BRUH - Anonymous Feedback System

Production-ready anonymous feedback platform with end-to-end encryption, built with Next.js 14, Supabase, and TypeScript.

## 🚀 Features

- **End-to-End Encryption**: Messages encrypted client-side using libsodium (NaCl box)
- **Multi-Platform**: Web + Mobile from single codebase (React Native Web + Expo)
- **Supabase Authentication**: Email magic link authentication (passwordless)
- **Payment Integration**: UPI payments via Paytm (PhonePe, Google Pay, etc.)
- **Moderation**: Keyword blocklist + AI-ready moderation hooks
- **Rate Limiting**: Atomic PostgreSQL-based rate limiting
- **Analytics**: Message volume, unique visitors, device tracking

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account
- Paytm merchant account (for UPI payments - https://business.paytm.com)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/DsChauhan08/BRUH.git
cd BRUH
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration:

```bash
cd supabase
npx supabase db push
```

Or manually execute `supabase/migrations/001_init.sql` in the SQL editor.

3. Deploy Edge Functions:

```bash
```bash
npx supabase functions deploy sendMessage
npx supabase functions deploy upiWebhook
npx supabase functions deploy moderationWorker
```
### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
```

**Required Variables:**

```bash
# Supabase (from project settings)
```bash
# Supabase (from project settings)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_JWT_SECRET=your-jwt-secret

# UPI Payments via Paytm (from dashboard.paytm.com)
UPI_PROVIDER=paytm
UPI_PROVIDER_MID=your-merchant-id
UPI_PROVIDER_KEY=your-merchant-key
UPI_PROVIDER_WEBSITE=WEBSTAGING
PAYTM_ENVIRONMENT=staging

# Security
RATE_LIMIT_SALT=$(openssl rand -base64 32)
``` 4. Set Up Payment Webhooks

**PayPal:**
1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
### 4. Set Up Payment Webhooks

### 4. Set Up Payment Webhooks

**Paytm (UPI):**
1. Sign up at [business.paytm.com](https://business.paytm.com)
2. Get merchant credentials from dashboard
3. Go to Developer Settings → Webhooks
4. Set webhook URL: `https://your-project.supabase.co/functions/v1/upiWebhook`
5. Enable transaction status webhooks
6. Copy MID and Merchant Key to `.env`

## 🚀 Running the Applicationuild
pnpm start
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t bruh:latest .
```

### Run with Docker Compose

```bash
# Make sure .env is configured
docker-compose up -d
```

### Push to GitHub Container Registry

```bash
docker tag bruh:latest ghcr.io/dschauhan08/bruh:latest
docker push ghcr.io/dschauhan08/bruh:latest
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Lint
pnpm lint
```

## 📊 Database Maintenance

### Clean up expired rate limits

```sql
SELECT cleanup_expired_rate_limits();
```

Run this periodically (e.g., via cron or pg_cron extension).

## 🔒 Security Notes

1. **Never commit** `.env` files
2. **Service role key** must only be used in server-side code
3. **Rate limit salt** should be unique per deployment
4. Private encryption keys stored client-side only (localStorage)
5. All webhook endpoints verify signatures

## 📈 Scaling Considerations

For 5,000 users / 10,000 messages per month (target):
- Single Supabase project sufficient
- Consider edge caching for public profile pages
- Monitor rate_limits table size (cleanup regularly)
- Enable Supabase connection pooling if needed

## 🆘 Troubleshooting

**Messages not decrypting:**
- Verify private key exists in localStorage
- Check browser console for encryption errors

**Payment webhook not firing:**
- Verify webhook URLs are publicly accessible
- Check webhook signature verification
- Review Supabase Edge Function logs

**Rate limiting too strict:**
- Adjust limits in `sendMessage` Edge Function
- Modify `check_and_increment_rate_limit` parameters

## 📄 License

See LICENSE file.

**Payment webhook not firing:**
- Verify webhook URLs are publicly accessible
- Check Paytm checksum verification in logs
- Review Supabase Edge Function logs
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

For deployment issues, check the acceptance checklist: `ACCEPTANCE_CHECKLIST.md`