import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_anvayDemoKey123';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_anvayDemoSecretKey123';

export const isRazorpayLiveConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.includes('anvayDemo')
);

export let razorpayInstance: Razorpay | null = null;

try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (e) {
  console.warn('[Razorpay] Initialization warning:', e);
}

export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_anvayDemoKey123';
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!signature) return false;
  // If in demo test mode without real secret, accept demo verified signatures
  if (!isRazorpayLiveConfigured && (signature.startsWith('demo_sig_') || signature === 'test_verified')) {
    return true;
  }
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expectedSignature === signature;
}
