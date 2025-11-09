import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  instagram_id: z.string().optional(),
  public_key: z.string(),
  is_paid: z.boolean().default(false),
  subscription_tier: z.enum(['free', 'basic', 'pro']).default('free'),
  preferences: z.record(z.any()).default({}),
  created_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Anonymous message schemas
export const MessageStatusSchema = z.enum(['visible', 'quarantined', 'blocked', 'deleted']);

export type MessageStatus = z.infer<typeof MessageStatusSchema>;

export const AnonymousMessageSchema = z.object({
  id: z.string().uuid(),
  recipient_user_id: z.string().uuid(),
  content_ciphertext: z.string(),
  content_nonce: z.string(),
  sender_public_key: z.string(),
  sender_device_hash: z.string(),
  sender_ip_hash: z.string(),
  sender_device_details: z.record(z.any()).optional(),
  moderated: z.boolean().default(false),
  moderation_score: z.number().min(0).max(1).optional(),
  status: MessageStatusSchema.default('visible'),
  created_at: z.string().datetime(),
});

export type AnonymousMessage = z.infer<typeof AnonymousMessageSchema>;

// Payment schemas
export const PaymentProviderSchema = z.enum([
  'crypto_nowpayments',
  'crypto_coinbase',
  'crypto_coingate',
  'upi_razorpay',
  'upi_paytm'
]);

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  provider: PaymentProviderSchema,
  provider_payment_id: z.string(),
  provider_subscription_id: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// Rate limit schemas
export const RateLimitSchema = z.object({
  id: z.string().uuid(),
  identifier: z.string(), // user_id or IP hash
  resource: z.string(), // e.g., "message_send"
  count: z.number().int().nonnegative(),
  window_start: z.string().datetime(),
  window_end: z.string().datetime(),
});

export type RateLimit = z.infer<typeof RateLimitSchema>;

// Device fingerprint schema
export const DeviceFingerprintSchema = z.object({
  userAgent: z.string(),
  language: z.string(),
  platform: z.string(),
  screenResolution: z.string().optional(),
  timezone: z.string().optional(),
  canvas: z.string().optional(), // canvas fingerprint hash
  webgl: z.string().optional(), // webgl fingerprint hash
  fonts: z.array(z.string()).optional(),
});

export type DeviceFingerprint = z.infer<typeof DeviceFingerprintSchema>;
