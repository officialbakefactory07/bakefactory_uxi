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

    if (!emailSent) {
      console.error('Failed to dispatch OTP email via Resend:', resendErrorMsg);
      return NextResponse.json({
        success: false,
        error: `Unable to send verification email. (${resendErrorMsg})`,
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      token,
      message: `Verification code sent to ${email}`,
    });
  } catch (error: any) {
    console.error('API send-otp error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process verification code' },
      { status: 500 }
    );
  }
}
