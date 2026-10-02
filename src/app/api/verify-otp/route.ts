import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpToken } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Missing request body' }, { status: 400 });
    }

    const { email, otp, token } = body;

    if (!email || !otp || !token) {
      return NextResponse.json(
        { error: 'Email, OTP code, and verification token are required' },
        { status: 400 }
      );
    }

    const result = verifyOtpToken(String(email), String(otp), String(token));

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Verification code confirmed successfully',
    });
  } catch (error: any) {
    console.error('API verify-otp error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
