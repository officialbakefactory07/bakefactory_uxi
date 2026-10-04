import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayClient, RAZORPAY_KEY_ID } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { amount, currency = 'INR', receipt, notes, orderId, customerName, email, phone } = body;

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount. Minimum amount is ₹1.' }, { status: 400 });
    }

    // Amount passed from cart/checkout is in INR Rupees (e.g., 1200 for ₹1200)
    // Razorpay orders API strictly expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(numericAmount * 100);

    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum order amount is ₹1.00 (100 paise)' }, { status: 400 });
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
