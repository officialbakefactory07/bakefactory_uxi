import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, order } = body;

    if (!email || !order) {
      return NextResponse.json({ error: 'Email and order data are required' }, { status: 400 });
    }

    const result = await sendOrderConfirmationEmail(email, order);

    return NextResponse.json({ success: true, message: 'Order confirmation email sent successfully' });
  } catch (error: any) {
    console.error('API order-email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send order email' },
      { status: 500 }
    );
  }
}
