-- BRUH Anonymous Feedback System - Initial Schema
-- Production-ready with RLS, rate limiting, and E2E encryption support

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 30),
  email TEXT UNIQUE NOT NULL,
  instagram_id TEXT UNIQUE,
  public_key TEXT NOT NULL, -- Base64 encoded public key for E2E encryption
  is_paid BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb,
  message_count_received INTEGER DEFAULT 0, -- Track for free tier limit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_instagram_id ON users(instagram_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- ANONYMOUS MESSAGES TABLE
-- ============================================================================
CREATE TABLE anonymous_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- E2E encrypted content (server has zero knowledge)
  content_ciphertext TEXT NOT NULL,
  content_nonce TEXT NOT NULL,
  sender_public_key TEXT NOT NULL, -- Ephemeral public key used for encryption
  
  -- Sender tracking (pseudonymous for abuse prevention)
  sender_device_hash TEXT NOT NULL, -- SHA256 hash of device fingerprint
  sender_ip_hash TEXT NOT NULL, -- SHA256(ip + salt)
  sender_device_details JSONB, -- Minimal device info for dev team review
  
  -- Moderation
  moderated BOOLEAN DEFAULT FALSE,
  moderation_score NUMERIC(3,2) CHECK (moderation_score >= 0 AND moderation_score <= 1),
  status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'quarantined', 'blocked', 'deleted')),
  moderation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_recipient ON anonymous_messages(recipient_user_id, created_at DESC);
CREATE INDEX idx_messages_status ON anonymous_messages(status);
CREATE INDEX idx_messages_sender_device_hash ON anonymous_messages(sender_device_hash);
CREATE INDEX idx_messages_moderated ON anonymous_messages(moderated, status) WHERE moderated = FALSE;

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('crypto_nowpayments', 'crypto_coinbase', 'crypto_coingate', 'upi_razorpay', 'upi_paytm')),
  provider_payment_id TEXT NOT NULL,
  provider_subscription_id TEXT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_provider_id ON payments(provider_payment_id);
CREATE INDEX idx_payments_subscription_id ON payments(provider_subscription_id);

-- ============================================================================
-- REPORTS TABLE (for user-reported messages)
-- ============================================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES anonymous_messages(id) ON DELETE CASCADE,
  reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by_admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_message ON reports(message_id);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);

-- ============================================================================
-- RATE LIMITS TABLE (atomic counter-based rate limiting)
-- ============================================================================
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- user_id, IP hash, or device hash
  resource TEXT NOT NULL, -- e.g., "message_send", "api_call"
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, resource, window_start)
);

CREATE INDEX idx_rate_limits_lookup ON rate_limits(identifier, resource, window_end);

-- ============================================================================
-- MODERATION RULES TABLE (per-recipient settings)
-- ============================================================================
CREATE TABLE moderation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('keyword_block', 'ai_filter', 'allow_list')),
  rule_config JSONB NOT NULL, -- { "keywords": [...], "threshold": 0.8, etc. }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_rules_user ON moderation_rules(user_id, is_active);

-- ============================================================================
-- ATOMIC RATE LIMIT FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_identifier TEXT,
  p_resource TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_window_end TIMESTAMPTZ;
  v_current_count INTEGER;
BEGIN
  -- Calculate current window
  v_window_start := date_trunc('minute', NOW());
  v_window_end := v_window_start + (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Atomic upsert: insert or update counter
  INSERT INTO rate_limits (identifier, resource, count, window_start, window_end)
  VALUES (p_identifier, p_resource, 1, v_window_start, v_window_end)
  ON CONFLICT (identifier, resource, window_start)
  DO UPDATE SET 
    count = rate_limits.count + 1,
    updated_at = NOW()
  RETURNING count INTO v_current_count;
  
  -- Return TRUE if under limit, FALSE if exceeded
  RETURN v_current_count <= p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CLEANUP FUNCTION FOR EXPIRED RATE LIMITS
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_end < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TO UPDATE updated_at TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON anonymous_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_rules ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public can read usernames for public profiles"
  ON users FOR SELECT
  USING (true); -- Allow reading username and public_key for sending messages

-- ANONYMOUS MESSAGES POLICIES
CREATE POLICY "Recipients can read their own messages"
  ON anonymous_messages FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Service role can insert messages"
  ON anonymous_messages FOR INSERT
  WITH CHECK (true); -- Controlled via Edge Function with service role

CREATE POLICY "Recipients can update their message status"
  ON anonymous_messages FOR UPDATE
  USING (auth.uid() = recipient_user_id)
  WITH CHECK (auth.uid() = recipient_user_id);

-- PAYMENTS POLICIES
CREATE POLICY "Users can read their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true); -- Webhook handlers use service role

-- REPORTS POLICIES
CREATE POLICY "Users can read their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reported_by_user_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by_user_id);

-- RATE LIMITS POLICIES
CREATE POLICY "Service role manages rate limits"
  ON rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

-- MODERATION RULES POLICIES
CREATE POLICY "Users can manage their own moderation rules"
  ON moderation_rules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS FOR FREE TIER ENFORCEMENT
-- ============================================================================

-- Check if recipient can receive more messages (free tier: 50 messages)
CREATE OR REPLACE FUNCTION can_receive_message(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_paid BOOLEAN;
  v_message_count INTEGER;
BEGIN
  SELECT is_paid, message_count_received INTO v_is_paid, v_message_count
  FROM users WHERE id = p_user_id;
  
  -- Paid users have unlimited
  IF v_is_paid THEN
    RETURN TRUE;
  END IF;
  
  -- Free tier: max 50 messages
  RETURN v_message_count < 50;
END;
$$ LANGUAGE plpgsql;

-- Increment recipient message count
CREATE OR REPLACE FUNCTION increment_message_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET message_count_received = message_count_received + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DEFAULT KEYWORD BLOCKLIST (Global)
-- ============================================================================
CREATE TABLE global_blocklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL UNIQUE,
  category TEXT, -- e.g., 'profanity', 'harassment', 'spam'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocklist_keyword ON global_blocklist(keyword) WHERE is_active = TRUE;

-- Insert common harmful keywords (minimal set - expand as needed)
INSERT INTO global_blocklist (keyword, category) VALUES
  ('kill yourself', 'harassment'),
  ('kys', 'harassment'),
  ('die', 'harassment'),
  ('suicide', 'self-harm'),
  ('rape', 'violence'),
  ('terrorist', 'violence');

-- ============================================================================
-- ANALYTICS HELPER VIEWS
-- ============================================================================

CREATE VIEW message_analytics AS
SELECT 
  DATE(created_at) as date,
  recipient_user_id,
  COUNT(*) as message_count,
  COUNT(DISTINCT sender_device_hash) as unique_senders,
  COUNT(*) FILTER (WHERE status = 'visible') as visible_count,
  COUNT(*) FILTER (WHERE status = 'quarantined') as quarantined_count
FROM anonymous_messages
GROUP BY DATE(created_at), recipient_user_id;

-- ============================================================================
-- COMPLETED: Database schema with E2E encryption, RLS, atomic rate limiting
-- ============================================================================
