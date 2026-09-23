import { NextRequest, NextResponse } from 'next/server';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, email, phone } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const amountInPaise = Math.round(parseFloat(amount) * 100);

    // If Razorpay API credentials are configured, create order via Razorpay API
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`;

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${orderId ? orderId.slice(0, 16) : Date.now()}`,
          notes: {
            orderId: orderId || '',
            customerName: customerName || '',
            email: email || '',
            phone: phone || '',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Razorpay Order Creation Error:', errorData);
        throw new Error(errorData?.error?.description || 'Failed to create Razorpay order');
      }

      const orderData = await response.json();

      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        key: RAZORPAY_KEY_ID,
      });
    }

    // Fallback if keys are being configured
    return NextResponse.json({
      success: true,
      orderId: `order_fake_${Date.now()}`,
      amount: amountInPaise,
      currency: 'INR',
      key: RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (err: any) {
    console.error('API razorpay create-order error:', err);
    return NextResponse.json(
      { error: err.message || 'Error initiating Razorpay checkout' },
      { status: 500 }
    );
  }
}
