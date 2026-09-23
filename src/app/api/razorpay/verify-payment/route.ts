import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId, // Firestore Document ID
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail,
    } = body;

    if (!orderId || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing required payment verification data' }, { status: 400 });
    }

    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update Firestore Order
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      const orderData = orderSnap.data();

      await updateDoc(orderRef, {
        paymentStatus: 'Paid (Razorpay Secured)',
        status: 'Preparing',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id || '',
        paidAt: serverTimestamp(),
      });

      // Send Resend confirmation email
      const targetEmail = userEmail || orderData.userEmail;
      if (targetEmail) {
        sendOrderConfirmationEmail(targetEmail, {
          id: orderId,
          ...orderData,
          paymentMethod: 'Online Payment (Razorpay)',
          paymentStatus: 'Paid',
        }).catch((e) => console.error('Error sending Razorpay confirmation email:', e));
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  } catch (err: any) {
    console.error('API razorpay verify-payment error:', err);
    return NextResponse.json(
      { error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
