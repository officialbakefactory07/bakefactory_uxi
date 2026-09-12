import { NextRequest, NextResponse } from 'next/server';
import { generatePayUHash, PAYU_MERCHANT_KEY, PAYU_PAYMENT_URL } from '@/lib/payu';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, customerName, email, phone, productInfo } = body;

    if (!orderId || !amount || !customerName || !email) {
      return NextResponse.json(
        { error: 'Missing required order details for PayU payment' },
        { status: 400 }
      );
    }

    if (!PAYU_MERCHANT_KEY) {
      return NextResponse.json(
        { 
          error: 'PayU Merchant credentials not configured. Please set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in environment variables.' 
        },
        { status: 500 }
      );
    }

    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);
    const txnid = `BF_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const sanitizedProductInfo = (productInfo || 'Bake Factory Bakery Order').replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 100);
    const sanitizedFirstName = customerName.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') || 'Customer';
    const sanitizedEmail = email.trim();
    const sanitizedPhone = (phone || '9999999999').replace(/[^0-9]/g, '').substring(0, 10);

    // Generate SHA-512 Hash with udf1 as orderId for reliable callback tracking
    const hash = generatePayUHash({
      txnid,
      amount: formattedAmount,
      productinfo: sanitizedProductInfo,
      firstname: sanitizedFirstName,
      email: sanitizedEmail,
      udf1: orderId, // Store Firestore Order ID in udf1
    });

    // Determine Base URL for callbacks
    const origin = req.headers.get('origin') || req.headers.get('referer') || process.env.NEXT_PUBLIC_BASE_URL || 'https://bakefactory.in';
    const baseUrl = origin.replace(/\/$/, '');
    const surl = `${baseUrl}/api/payu/callback`;
    const furl = `${baseUrl}/api/payu/callback`;

    return NextResponse.json({
      success: true,
      actionUrl: PAYU_PAYMENT_URL,
      params: {
        key: PAYU_MERCHANT_KEY,
        txnid,
        amount: formattedAmount,
        productinfo: sanitizedProductInfo,
        firstname: sanitizedFirstName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        surl,
        furl,
        hash,
        udf1: orderId,
        service_provider: 'payu_paisa'
      }
    });
  } catch (err: any) {
    console.error('PayU create-payment error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize PayU payment' },
      { status: 500 }
    );
  }
}
