import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await sendOtpEmail(email, otp, name);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp // Return in response for client verification/testing
    });
  } catch (error: any) {
    console.error('API send-otp error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP email' },
      { status: 500 }
    );
  }
}
