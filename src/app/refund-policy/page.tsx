"use client";

import React from 'react';
import Link from 'next/link';
import { RotateCcw, ChevronRight } from 'lucide-react';
import styles from '../terms/page.module.css';

export default function RefundPolicyPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <RotateCcw size={16} />
            <span>CUSTOMER ASSURANCE</span>
          </div>
          <h1>Cancellation & Refund Policy</h1>
          <p>Last updated: September 12, 2026 &bull; Clear, fair, and transparent refund terms</p>
        </div>
      </section>

      <div className={styles.contentWrap}>
        <div className={styles.card}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <ChevronRight size={14} />
            <span>Cancellation & Refund Policy</span>
          </div>

          <section className={styles.section}>
            <h2>1. Order Cancellation Policy</h2>
            <p>
              Because all cakes, pastries, and artisanal desserts at Bake Factory are prepared fresh upon order:
            </p>
            <ul>
              <li><strong>Standard Ready-to-Bake Orders:</strong> You may cancel your order within <strong>30 minutes</strong> of placement or before preparation has commenced by calling our hotline at <strong>+91 79894 99446</strong>. In such cases, a <strong>100% full refund</strong> will be issued.</li>
              <li><strong>Custom Designer / Fondant Cakes:</strong> Customized cakes requiring special cake toppers or extensive artisan prep may be cancelled at least <strong>12 hours prior</strong> to the scheduled delivery time for a full refund. Once customized baking has commenced, cancellations cannot be accommodated.</li>
              <li><strong>After Dispatch:</strong> Once your cake has left our kitchen for delivery, orders cannot be cancelled due to the perishable nature of food items.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. Replacement & Quality Guarantee</h2>
            <p>
              We take utmost care in packaging and temperature-controlled handling. However, if your order arrives in any of the following conditions:
            </p>
            <ul>
              <li>The cake was physically damaged during transit.</li>
              <li>The wrong flavor or incorrect customized message was delivered.</li>
              <li>There is an objective quality defect upon receipt.</li>
            </ul>
            <p>
              Please notify us within <strong>2 hours of delivery</strong> by sending a photo or video of the cake to our WhatsApp hotline (<strong>+91 79894 99446</strong>) or email (<strong>officialbakefactory@gmail.com</strong>). We will immediately dispatch a <strong>free replacement</strong> or issue a <strong>100% instant refund</strong>.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Refund Processing & Timelines</h2>
            <p>
              Approved refunds are credited directly back to the original source of payment:
            </p>
            <ul>
              <li><strong>Online Payments (PayU &ndash; UPI / Cards / NetBanking):</strong> Refunds are initiated within <strong>24 hours</strong> of approval. Depending on your issuing bank, the amount will reflect in your account within <strong>5 to 7 business days</strong>.</li>
              <li><strong>UPI / Instant Wallet:</strong> Usually reflects within <strong>24 to 48 hours</strong>.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds for verified COD issues are processed via direct UPI transfer or store credit upon customer confirmation.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Non-Refundable Scenarios</h2>
            <p>Refunds cannot be issued under the following circumstances:</p>
            <ul>
              <li>Incorrect delivery address or unreachable recipient phone number provided during checkout.</li>
              <li>Recipient refuses to accept the delivery of freshly prepared perishable goods.</li>
              <li>Improper storage or handling of the cake after successful delivery (e.g., leaving fresh cream cakes out in high ambient temperatures).</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Contact Our Support Team</h2>
            <p>For any cancellation or refund requests, please reach out to us:</p>
            <div className={styles.contactBox}>
              <p><strong>Legal Entity / FBO:</strong> VENIGALLA THUSHITHA (BAKE FACTORY)</p>
              <p><strong>FSSAI Registration No:</strong> 20126141002411</p>
              <p><strong>Registered Address:</strong> Bake Factory, #12-1/2, Near Rohan&apos;s Pride Appartments, Amaravathi Road, Undavalli (Rural), Tadepalle, Guntur, AP &ndash; 522501</p>
              <p><strong>Hotline &amp; WhatsApp:</strong> <a href="tel:+917989499446">+91 79894 99446</a></p>
              <p><strong>Email:</strong> <a href="mailto:officialbakefactory@gmail.com">officialbakefactory@gmail.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
