import { Resend } from 'resend';

// Read API key from environment variable (configured in Vercel or .env.local)
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export const resend = new Resend(RESEND_API_KEY);

// Default sender address (Using verified domain or resend dev onboarding address)
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bake Factory <onboarding@resend.dev>';
export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_EMAIL || 'officialbakefactory@gmail.com';

/**
 * Send 6-digit OTP email to user
 */
export async function sendOtpEmail(toEmail: string, otp: string, userName?: string) {
  try {
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FCF8F2; padding: 40px 20px; color: #23160E;">
        <div style="max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8DFD5; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="font-size: 24px; color: #23160E; margin: 0; letter-spacing: 1px;">BAKE FACTORY</h2>
            <p style="font-size: 12px; color: #B8820B; text-transform: uppercase; margin-top: 4px; font-weight: 700;">Artisanal Cakes & Gourmet Desserts</p>
          </div>
          <div style="border-top: 1px solid #F0E6D8; margin-bottom: 24px;"></div>
          <p style="font-size: 16px; margin-bottom: 8px;">Hello ${userName || 'Valued Customer'},</p>
          <p style="font-size: 14px; color: #66564B; line-height: 1.6; margin-bottom: 24px;">
            Here is your One-Time Password (OTP) for authenticating with Bake Factory. This code is valid for 10 minutes.
          </p>
          <div style="background: #FEF8E7; border: 2px dashed #D4A017; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #23160E;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #9E8E81; text-align: center; margin: 0;">
            If you did not request this code, please ignore this email.
          </p>
          <div style="border-top: 1px solid #F0E6D8; margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #9E8E81;">
            Bake Factory Studio • Tadepalle, Vijayawada • +91 79894 99446
          </div>
        </div>
      </div>
    `;

    return await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `Your Bake Factory Verification Code: ${otp}`,
      html: htmlContent,
    });
  } catch (err) {
    console.error('Error sending OTP email via Resend:', err);
    throw err;
  }
}

/**
 * Send order confirmation email receipt to customer
 */
export async function sendOrderConfirmationEmail(toEmail: string, order: any) {
  try {
    const itemsHtml = (order.items || []).map((item: any) => `
      <tr style="border-bottom: 1px solid #F0E6D8;">
        <td style="padding: 10px 0; font-size: 14px; color: #23160E;">
          <strong>${item.name}</strong>
          ${item.selectedWeight ? `<br><small style="color: #8C7A6B;">Weight: ${item.selectedWeight}</small>` : ''}
          ${item.cakeMessage ? `<br><small style="color: #B8820B;">Note: "${item.cakeMessage}"</small>` : ''}
        </td>
        <td style="padding: 10px 0; text-align: center; font-size: 14px; color: #23160E;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-size: 14px; font-weight: 700; color: #23160E;">₹${(item.price * item.quantity).toFixed(0)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FCF8F2; padding: 40px 20px; color: #23160E;">
        <div style="max-width: 550px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8DFD5; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 24px; color: #23160E; margin: 0; letter-spacing: 1px;">BAKE FACTORY</h2>
            <p style="font-size: 12px; color: #B8820B; text-transform: uppercase; margin-top: 4px; font-weight: 700;">Order Confirmed & Freshly Baking!</p>
          </div>
          <div style="border-top: 1px solid #F0E6D8; margin-bottom: 20px;"></div>
          
          <div style="background: #FEFBF3; border-radius: 10px; padding: 16px; margin-bottom: 20px; border: 1px solid #F0E6D8;">
            <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Order ID:</strong> #${order.id || order.invoiceNumber || 'BF-ORD'}</p>
            <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Customer:</strong> ${order.customerName || order.userEmail || 'Valued Customer'}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #E8DFD5;">
                <th style="text-align: left; padding: 8px 0; font-size: 12px; color: #8C7A6B; text-transform: uppercase;">Item</th>
                <th style="text-align: center; padding: 8px 0; font-size: 12px; color: #8C7A6B; text-transform: uppercase;">Qty</th>
                <th style="text-align: right; padding: 8px 0; font-size: 12px; color: #8C7A6B; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #E8DFD5; padding-top: 12px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #23160E;">
              <span>Grand Total:</span>
              <span>₹${(order.totalPrice || order.total || 0).toFixed(0)}</span>
            </div>
          </div>

          <div style="background: #E8F5E9; border-radius: 8px; padding: 12px; text-align: center; color: #2E7D32; font-weight: 700; font-size: 13px; margin-bottom: 20px;">
            ✦ Estimated delivery / pickup: 45 - 60 minutes
          </div>

          <p style="font-size: 12px; color: #8C7A6B; text-align: center; margin: 0;">
            Thank you for ordering with Bake Factory! If you have any special instructions, call us at <strong>+91 79894 99446</strong>.
          </p>
        </div>
      </div>
    `;

    return await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `Order Confirmation #${order.id || 'BakeFactory'} - Bake Factory`,
      html: htmlContent,
    });
  } catch (err) {
    console.error('Error sending order confirmation email via Resend:', err);
    throw err;
  }
}

/**
 * Send contact inquiry notification to admin
 */
export async function sendContactNotificationEmail(contactData: { name: string; email?: string; phone?: string; message: string }) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #23160E;">
        <h2>📬 New Website Contact Inquiry</h2>
        <p><strong>From:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
        <hr/>
        <p><strong>Message / Requirement:</strong></p>
        <blockquote style="background: #F4ECE1; padding: 12px; border-left: 4px solid #D4A017; font-style: italic;">
          ${contactData.message}
        </blockquote>
      </div>
    `;

    return await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_NOTIFICATION_EMAIL],
      subject: `New Contact Message from ${contactData.name}`,
      html: htmlContent,
    });
  } catch (err) {
    console.error('Error sending contact notification via Resend:', err);
    throw err;
  }
}
