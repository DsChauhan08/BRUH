# BRUH - Quick Deployment Guide

This guide gets BRUH running in production in under 30 minutes.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub account
- [ ] Supabase account (free tier sufficient)
- [ ] PayPal developer account
- [ ] Razorpay account (for Indian UPI payments)
- [ ] Instagram/Meta developer account
- [ ] Firebase account (for push notifications)
- [ ] Domain name (optional, can use Vercel subdomain)

## Step-by-Step Deployment

### 1. Initial Setup (5 minutes)

```bash
# Clone repository
git clone https://github.com/DsChauhan08/BRUH.git
cd BRUH

# Run setup script
./setup.sh

# This will:
# - Install dependencies
# - Build packages
# - Create .env file from template
```

### 2. Supabase Setup (10 minutes)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy URL and keys

2. **Run Migration**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link project
   supabase link --project-ref your-project-ref
   
   # Push schema
   supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy sendMessage
   supabase functions deploy paypalWebhook
   supabase functions deploy upiWebhook
   supabase functions deploy moderationWorker
   ```

4. **Set Edge Function Secrets**
   ```bash
   supabase secrets set RATE_LIMIT_SALT=your-generated-salt
   supabase secrets set PAYPAL_CLIENT_ID=your-paypal-id
   supabase secrets set PAYPAL_CLIENT_SECRET=your-paypal-secret
   supabase secrets set UPI_PROVIDER_KEY=your-razorpay-key
   supabase secrets set UPI_PROVIDER_SECRET=your-razorpay-secret
   ```

### 3. Instagram OAuth Setup (5 minutes)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create new app → "Consumer"
3. Add "Instagram Basic Display" product
4. Configure:
   - Valid OAuth Redirect URIs: `https://yourdomain.com/auth/callback`
   - Copy Client ID and Secret

### 4. PayPal Setup (5 minutes)

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create app (choose "Merchant" type)
3. Enable "Subscriptions" feature
4. Create subscription plans:
   - Basic: ₹99/month
   - Pro: ₹299/month (optional)
5. Create webhook:
   - URL: `https://your-supabase-url/functions/v1/paypalWebhook`
   - Events: `BILLING.SUBSCRIPTION.*`, `PAYMENT.SALE.COMPLETED`
   - Copy Webhook ID

### 5. Razorpay Setup (5 minutes)

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Copy API keys (test or live)
3. Create webhook:
   - URL: `https://your-supabase-url/functions/v1/upiWebhook`
   - Active Events: `payment.captured`, `payment.authorized`
   - Copy webhook secret

### 6. Configure Environment Variables

Edit `.env` with all credentials from above steps:

```bash
# Supabase (from project settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

# Instagram OAuth
INSTAGRAM_OAUTH_CLIENT_ID=123456789
INSTAGRAM_OAUTH_CLIENT_SECRET=abc123...
INSTAGRAM_OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback

# PayPal
PAYPAL_CLIENT_ID=Abc123...
PAYPAL_CLIENT_SECRET=EFG456...
PAYPAL_WEBHOOK_ID=WH-123...
PAYPAL_API_BASE=https://api-m.paypal.com  # or .sandbox.paypal.com for testing

# Razorpay
UPI_PROVIDER=razorpay
UPI_PROVIDER_KEY=rzp_live_xxx  # or rzp_test_xxx
UPI_PROVIDER_SECRET=your_secret

# Security (generate with: openssl rand -base64 32)
RATE_LIMIT_SALT=random-32-char-string

# Firebase (from Firebase console → Project settings → Cloud Messaging)
FCM_SERVER_KEY=AAAA...

# App
APP_DOMAIN=bruh.ngl.app
NEXT_PUBLIC_APP_URL=https://bruh.ngl.app
```

### 7. Deploy to Vercel (3 minutes)

**Option A: Using Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel

# During setup:
# - Link to existing project or create new
# - Set root directory to: apps/web
# - Import all environment variables from .env
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Import Git repository
3. Configure:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm install && pnpm build`
   - Output Directory: `.next`
4. Add all environment variables from `.env`
5. Deploy

### 8. Docker Deployment (Alternative)

If deploying to your own server:

```bash
# Build image
docker build -t bruh:latest .

# Push to registry
docker tag bruh:latest ghcr.io/yourusername/bruh:latest
docker push ghcr.io/yourusername/bruh:latest

# On server, create .env file, then:
docker-compose up -d
```

### 9. Post-Deployment Verification

1. **Test Homepage**: Visit `https://yourdomain.com`
2. **Test Login**: Try Instagram OAuth
3. **Create Test User**: Login and generate shareable link
4. **Send Test Message**: 
   - Go to your link in incognito mode
   - Send anonymous message
   - Verify encryption (check network tab - should see ciphertext)
5. **Check Dashboard**: Login and verify message appears decrypted
6. **Test Rate Limit**: Send 4 messages rapidly (4th should fail)
7. **Test Payments**: 
   - Subscribe with PayPal sandbox account
   - Verify webhook fires and subscription updates
8. **Run E2E Tests**:
   ```bash
   PLAYWRIGHT_TEST_BASE_URL=https://yourdomain.com pnpm test:e2e
   ```

## Production Checklist

- [ ] SSL certificate active (HTTPS)
- [ ] All environment variables set
- [ ] Supabase Edge Functions deployed
- [ ] Database migration applied
- [ ] PayPal webhooks configured and verified
- [ ] Razorpay webhooks configured
- [ ] Instagram OAuth redirect URIs match production URL
- [ ] Legal pages accessible (/legal/terms, /legal/privacy, /legal/refund-policy)
- [ ] Error monitoring configured (optional: Sentry)
- [ ] Analytics configured (optional: Plausible)
- [ ] Backup strategy in place
- [ ] Domain DNS configured
- [ ] CORS headers tested
- [ ] Rate limiting tested
- [ ] E2E encryption verified

## Troubleshooting

### Messages not sending
- Check Supabase Edge Function logs: `supabase functions logs sendMessage`
- Verify recipient exists and hasn't hit free tier limit
- Check rate limit status in database

### Payments not working
- Verify webhook URLs are publicly accessible
- Check webhook signature secrets match
- Review Edge Function logs for webhook events
- Test with PayPal sandbox first

### Authentication failing
- Verify Instagram OAuth redirect URI matches exactly
- Check Instagram app is in "Live" mode (not "Development")
- Ensure callback route exists at `/auth/callback`

### Build failing
- Clear .next cache: `rm -rf apps/web/.next`
- Rebuild packages: `pnpm --filter @bruh/crypto build && pnpm --filter @bruh/db build`
- Check Node version: `node -v` (should be 18+)

## Maintenance Tasks

### Weekly
- Check Supabase storage usage
- Review moderation queue
- Monitor error logs

### Monthly
- Run rate limit cleanup: `SELECT cleanup_expired_rate_limits();`
- Review payment webhook logs
- Update dependencies: `pnpm update --interactive`

### As Needed
- Rotate secrets (rate limit salt, webhook secrets)
- Update global blocklist keywords
- Add new moderation rules

## Scaling Beyond 5K Users

If you exceed target scale:

1. **Database**: Upgrade Supabase plan or migrate to managed Postgres
2. **Edge Functions**: Already auto-scale with Supabase
3. **Storage**: Enable Supabase CDN for static assets
4. **Caching**: Add Redis for rate limiting (replace SQL-based)
5. **Analytics**: Move to dedicated analytics DB (ClickHouse/BigQuery)

## Support

- Documentation: See `README.md` and `ACCEPTANCE_CHECKLIST.md`
- Issues: [GitHub Issues](https://github.com/DsChauhan08/BRUH/issues)
- Supabase Support: [supabase.com/support](https://supabase.com/support)

---

**Deployment Complete!** 🎉

Your BRUH instance should now be live at `https://yourdomain.com`

Share your first link: `https://yourdomain.com/u/yourusername`
