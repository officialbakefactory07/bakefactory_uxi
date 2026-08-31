import { NextRequest, NextResponse } from 'next/server';
import { sendContactNotificationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    const result = await sendContactNotificationEmail({ name, email, phone, message });

    return NextResponse.json({ success: true, message: 'Contact inquiry forwarded via email' });
  } catch (error: any) {
    console.error('API contact-email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send contact email' },
      { status: 500 }
    );
  }
}
