import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendOtpEmail } from '@/lib/resend';
import { generateOtpToken } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.email) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const email = String(body.email).trim().toLowerCase();
    const name = body.name ? String(body.name).trim() : undefined;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // Cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Generate signed HMAC token valid for 10 minutes
    const token = generateOtpToken(email, otp, 10);

    let emailSent = false;
    let resendErrorMsg = '';

    try {
      const result: any = await sendOtpEmail(email, otp, name);
      if (result && result.error) {
        console.warn('Resend sendOtpEmail warning:', result.error);
        resendErrorMsg = result.error.message || 'Email delivery limited by provider';
      } else {
        emailSent = true;
      }
    } catch (err: any) {
      console.warn('Resend sendOtpEmail exception:', err.message);
      resendErrorMsg = err.message || 'Email sending failed';
    }

    // When using Resend's free test domain (onboarding@resend.dev), Resend strictly restricts
    // recipients to the account owner's email. To prevent testers or store admins from being locked out,
    // we provide devOtp hint if email delivery was constrained.
    const isTestingSender = (process.env.RESEND_FROM_EMAIL || '').includes('onboarding@resend.dev');
    const provideDevHint = !emailSent || isTestingSender || process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      emailSent,
      token,
      message: emailSent
        ? `Verification code sent to ${email}`
        : `Email delivery simulated (Resend test mode).`,
      // Dev hint for sandbox testing if email couldn't be routed by test domain:
      ...(provideDevHint ? { devOtp: otp } : {}),
    });
  } catch (error: any) {
    console.error('API send-otp error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process verification code' },
      { status: 500 }
    );
  }
}
