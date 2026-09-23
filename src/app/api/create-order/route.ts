import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayClient, RAZORPAY_KEY_ID } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { amount, currency = 'INR', receipt, notes, orderId, customerName, email, phone } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount. Minimum amount is 100 paise (₹1).' }, { status: 400 });
    }

    // Ensure amount is in paise (minimum 100 paise)
    let amountInPaise = Math.round(Number(amount));
    // If amount is small float like 45.5, convert to paise
    if (amountInPaise < 100 && Number(amount) > 0) {
      amountInPaise = Math.round(Number(amount) * 100);
    }

    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum order amount is 100 paise (₹1.00)' }, { status: 400 });
    }

    const receiptId = receipt || `rcpt_${orderId ? String(orderId).slice(0, 16) : Date.now()}`;

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: receiptId,
      notes: {
        orderId: orderId || '',
        customerName: customerName || '',
        email: email || '',
        phone: phone || '',
        ...(notes || {}),
      },
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('API create-order error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
