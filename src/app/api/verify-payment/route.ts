import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order_id = body.razorpay_order_id || body.order_id || body.razorpayOrderId;
    const payment_id = body.razorpay_payment_id || body.payment_id || body.razorpayPaymentId;
    const signature = body.razorpay_signature || body.signature || body.razorpaySignature;
    const firestoreOrderId = body.orderId || body.firestoreOrderId;
    const userEmail = body.userEmail || body.email;

    if (!payment_id) {
      return NextResponse.json({ error: 'Missing payment ID (razorpay_payment_id)' }, { status: 400 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature (razorpay_signature)' }, { status: 400 });
    }

    const isValid = verifyRazorpayPaymentSignature({
      orderId: order_id || '',
      paymentId: payment_id,
      signature: signature,
    });

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // If a Firestore order ID is provided, update order record
    if (firestoreOrderId) {
      try {
        const orderRef = doc(db, 'orders', firestoreOrderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();

          await updateDoc(orderRef, {
            paymentStatus: 'Paid (Razorpay Secured)',
            status: 'Preparing',
            razorpayPaymentId: payment_id,
            razorpayOrderId: order_id || '',
            paidAt: serverTimestamp(),
          });

          // Send confirmation email if email available
          const targetEmail = userEmail || orderData.userEmail;
          if (targetEmail) {
            sendOrderConfirmationEmail(targetEmail, {
              id: firestoreOrderId,
              ...orderData,
              paymentMethod: 'Online Payment (Razorpay)',
              paymentStatus: 'Paid',
            }).catch((e) => console.error('Error sending Razorpay confirmation email:', e));
          }
        }
      } catch (dbErr) {
        console.error('Firestore order update error in verify-payment:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      razorpay_order_id: order_id,
      razorpay_payment_id: payment_id,
    });
  } catch (err: any) {
    console.error('API verify-payment error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
