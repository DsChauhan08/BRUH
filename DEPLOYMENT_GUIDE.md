# BRUH - Deployment Guide

## 🚀 Free Hosting Setup (Vercel + Supabase)

### Prerequisites
- GitHub account
- Vercel account (free tier)
- Supabase account (free tier)
- Paytm merchant account

---

## Step 1: Supabase Setup (5 minutes)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization, name: `bruh-prod`
   - Region: Choose closest to India (e.g., Mumbai)
   - Wait for provisioning (~2 minutes)

2. **Run Database Migration**
   ```bash
   cd supabase
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy sendMessage
   npx supabase functions deploy upiWebhook
   npx supabase functions deploy moderationWorker
   ```

4. **Get Credentials**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Paytm Setup (10 minutes)

1. **Create Merchant Account**
   - Go to [business.paytm.com](https://business.paytm.com)
   - Sign up as merchant
   - Complete KYC verification

2. **Get Test Credentials**
   - Dashboard → Developer Settings → API Keys
   - Copy:
     - Merchant ID (MID) → `UPI_PROVIDER_MID`
     - Merchant Key → `UPI_PROVIDER_KEY`
   - For testing: Use `WEBSTAGING` as website name

3. **Configure Webhook**
   - Go to Developer Settings → Webhooks
   - Add webhook URL: `https://YOUR_SUPABASE_URL/functions/v1/upiWebhook`
   - Enable "Transaction Status" notifications

---

## Step 3: Vercel Deployment (3 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo `BRUH`
   - Root Directory: `apps/web`
   - Framework Preset: Next.js

3. **Configure Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   
   # Paytm
   UPI_PROVIDER=paytm
   UPI_PROVIDER_MID=your-merchant-id
   UPI_PROVIDER_KEY=your-merchant-key
   UPI_PROVIDER_WEBSITE=WEBSTAGING
   PAYTM_ENVIRONMENT=staging
   
   # Security
   RATE_LIMIT_SALT=your-random-32-char-string
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live at `bruh-xxx.vercel.app`

---

## Step 4: Testing (5 minutes)

1. **Test Auth Flow**
   - Go to your Vercel URL
   - Click "Get Started"
   - Enter email, receive magic link
   - Verify you can access dashboard

2. **Test Payment**
   - Click "Upgrade to Pro"
   - Click "Pay ₹299 with UPI"
   - Use Paytm test credentials:
     - Card: 4111 1111 1111 1111
     - CVV: 123
     - Expiry: Any future date
   - Verify webhook receives callback

3. **Test Messaging**
   - Share your link: `your-domain.vercel.app/u/USERNAME`
   - Send anonymous message
   - Check it appears in dashboard

---

## Step 5: Production Setup

### Enable Production Mode

1. **Paytm Production**
   - Complete full merchant verification
   - Switch to production credentials
   - Update env vars: `PAYTM_ENVIRONMENT=production`
   - Use `WEBPROD` as website name

2. **Custom Domain (Optional)**
   - Buy domain from Namecheap/GoDaddy
   - Vercel → Settings → Domains → Add Domain
   - Update DNS records as instructed

3. **Monitoring**
   - Enable Vercel Analytics (free)
   - Monitor Supabase logs for errors
   - Set up alerts for failed payments

---

## Cost Breakdown

### Free Tier (Good for 5K users)
- **Vercel**: 100GB bandwidth/month - FREE
- **Supabase**: 500MB DB, 50K users - FREE
- **Paytm**: 1.99% transaction fee only
- **Total**: ₹0/month (only transaction fees)

### Paid Tier (For scaling)
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Supabase Pro**: $25/month (8GB DB, 100K users)
- **Domain**: ~₹800/year
- **Total**: ~₹3,700/month

---

## Troubleshooting

### Build Fails on Vercel
- Check Root Directory is set to `apps/web`
- Verify all environment variables are set
- Check build logs for missing dependencies

### Payments Not Working
- Verify webhook URL is correct
- Check Paytm dashboard for failed transactions
- Review Supabase Edge Function logs
- Ensure checksum calculation matches Paytm's

### Messages Not Decrypting
- Clear browser localStorage
- Generate new keypair from dashboard
- Check encryption library is loaded

---

## Security Checklist

- [ ] Change all default credentials
- [ ] Enable Supabase RLS policies
- [ ] Set strong RATE_LIMIT_SALT
- [ ] Enable HTTPS only (Vercel auto)
- [ ] Review webhook security
- [ ] Set up monitoring alerts
- [ ] Enable 2FA on all accounts

---

## Next Steps

1. **Marketing**: Share your link on social media
2. **Analytics**: Monitor user behavior in Vercel Analytics
3. **Feedback**: Collect user feedback for improvements
4. **Scale**: Upgrade to paid tiers when needed

---

## Support

- **Supabase Issues**: [supabase.com/support](https://supabase.com/support)
- **Vercel Issues**: [vercel.com/support](https://vercel.com/support)
- **Paytm Issues**: [developer.paytm.com/support](https://developer.paytm.com/support)

**Estimated Time to Deploy**: 20-30 minutes
**Cost**: FREE (only Paytm transaction fees)
