import { NextRequest, NextResponse } from 'next/server';
import { verifyPayUResponseHash } from '@/lib/payu';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((val, key) => {
      data[key] = val.toString();
    });

    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      udf1: orderId,
      mihpayid,
      mode,
      error_Message,
      additionalCharges
    } = data;

    const origin = req.headers.get('origin') || req.headers.get('referer') || process.env.NEXT_PUBLIC_BASE_URL || 'https://bakefactory.in';
    const baseUrl = origin.replace(/\/$/, '');

    // Verify Response Hash
    const isHashValid = verifyPayUResponseHash({
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      udf1: orderId,
      additionalCharges
    });

    if (!isHashValid) {
      console.warn('PayU Callback Hash Mismatch for txnid:', txnid);
    }

    const isSuccess = status?.toLowerCase() === 'success';

    if (orderId) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const existingOrder = orderSnap.data();

          if (isSuccess) {
            await updateDoc(orderRef, {
              paymentStatus: 'Paid (PayU Gateway)',
              status: 'Preparing',
              payuTxnId: txnid,
              payuPaymentId: mihpayid || '',
              paymentMode: mode || 'Online (PayU)',
              paidAt: serverTimestamp()
            });

            // Trigger Resend confirmation receipt email
            if (email || existingOrder.userEmail) {
              sendOrderConfirmationEmail(email || existingOrder.userEmail, {
                id: orderId,
                ...existingOrder,
                paymentMethod: `PayU (${mode || 'Online'})`,
                paymentStatus: 'Paid'
              }).catch(e => console.error('Error sending PayU order email:', e));
            }
          } else {
            await updateDoc(orderRef, {
              paymentStatus: `Failed: ${error_Message || 'Payment Cancelled by User'}`,
              status: 'Cancelled',
              payuTxnId: txnid,
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (dbErr) {
        console.error('Error updating order on PayU callback:', dbErr);
      }
    }

    if (isSuccess) {
      return NextResponse.redirect(`${baseUrl}/order-success?id=${orderId || txnid}&status=success`, { status: 303 });
    } else {
      const errMsg = encodeURIComponent(error_Message || 'Payment was not completed.');
      return NextResponse.redirect(`${baseUrl}/cart?payment_error=${errMsg}`, { status: 303 });
    }
  } catch (err: any) {
    console.error('PayU Callback Error:', err);
    return NextResponse.redirect(`https://bakefactory.in/cart?payment_error=An%20unexpected%20error%20occurred`, { status: 303 });
  }
}
