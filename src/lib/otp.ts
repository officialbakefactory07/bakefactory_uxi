import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || process.env.RAZORPAY_KEY_SECRET || 'bakefactory-auth-security-salt-2026!';

/**
 * Creates a signed, tamper-proof token containing the OTP expiry and cryptographic hash.
 * This ensures the server remains stateless without storing OTPs in plaintext databases.
 */
export function generateOtpToken(email: string, otp: string, expiresInMinutes = 10): string {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const payload = `${email.trim().toLowerCase()}:${otp.trim()}:${expiresAt}`;
  const hash = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(payload)
    .digest('hex');

  return `${expiresAt}.${hash}`;
}

/**
 * Verifies the user-submitted OTP against the cryptographic token.
 */
export function verifyOtpToken(
  email: string,
  submittedOtp: string,
  token: string
): { valid: boolean; error?: string } {
  if (!token || !submittedOtp || !email) {
    return { valid: false, error: 'Missing verification parameters.' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid token structure.' };
  }

  const [expiresAtStr, clientHash] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt)) {
    return { valid: false, error: 'Invalid token timestamp.' };
  }

  if (Date.now() > expiresAt) {
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  const cleanOtp = submittedOtp.trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return { valid: false, error: 'Verification code must be exactly 6 digits.' };
  }

  const payload = `${email.trim().toLowerCase()}:${cleanOtp}:${expiresAt}`;
  const expectedHash = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  const expectedBuf = Buffer.from(expectedHash, 'utf8');
  const clientBuf = Buffer.from(clientHash, 'utf8');

  if (expectedBuf.length !== clientBuf.length || !crypto.timingSafeEqual(expectedBuf, clientBuf)) {
    return { valid: false, error: 'Incorrect verification code. Please check and try again.' };
  }

  return { valid: true };
}
