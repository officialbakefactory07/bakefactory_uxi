"use client";

import React from 'react';
import Link from 'next/link';
import { Lock, ChevronRight } from 'lucide-react';
import styles from '../terms/page.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Lock size={16} />
            <span>DATA PROTECTION</span>
          </div>
          <h1>Privacy Policy</h1>
          <p>Last updated: September 12, 2026 &bull; Committed to protecting your personal information</p>
        </div>
      </section>

      <div className={styles.contentWrap}>
        <div className={styles.card}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <ChevronRight size={14} />
            <span>Privacy Policy</span>
          </div>

          <section className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>
              When you browse our bakery catalog, create an account, place an order, or contact us, we may collect the following information:
            </p>
            <ul>
              <li><strong>Contact Details:</strong> Full Name, Email Address, Phone/Mobile Number, Delivery Address, Postal Code (PIN code).</li>
              <li><strong>Order History:</strong> Cakes and items purchased, customization notes (e.g., birthday messages), delivery dates, and invoice amounts.</li>
              <li><strong>Technical Data:</strong> IP address, device type, browser information, and cookies to ensure seamless checkout session management.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. How We Use Your Information</h2>
            <p>We use collected data strictly for the following legitimate purposes:</p>
            <ul>
              <li>To prepare, bake, and dispatch your bakery orders accurately to your delivery address in Vijayawada.</li>
              <li>To send order confirmation receipts, OTP verification codes, and real-time live order tracking status updates via Resend email.</li>
              <li>To securely process payments through authorized gateway partners (PayU).</li>
              <li>To provide customer support and handle inquiries or dietary customization requests.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Payment Data Security (PayU Gateway)</h2>
            <p>
              <strong>Bake Factory does NOT store or process your credit card numbers, debit card PINs, CVV, or NetBanking passwords on our servers.</strong>
            </p>
            <p>
              All online payment transactions are directed to <strong>PayU Payments Private Limited</strong>, which is fully certified under <strong>PCI-DSS Level 1 compliance</strong> and encrypted using 256-bit SSL protocols.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Information Sharing & Third Parties</h2>
            <p>
              We respect your privacy. <strong>We NEVER sell, trade, or rent your personal data to third-party marketing companies.</strong> Data is shared only with:
            </p>
            <ul>
              <li><strong>Payment Aggregators (PayU):</strong> For payment authentication and settlement.</li>
              <li><strong>Delivery Personnel:</strong> Only recipient name, contact phone number, and delivery address to complete physical handover of freshly baked goods.</li>
              <li><strong>Legal Authorities:</strong> If required by Indian law, regulation, or court order.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Cookies & Local Storage</h2>
            <p>
              Our website uses essential session cookies and local browser storage to keep track of your shopping cart items, saved delivery address, and login sessions. You can clear cookies anytime in your browser settings.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Data Rights & Contact Information</h2>
            <p>
              You have the right to request access to or deletion of your personal data. For privacy inquiries, security concerns, or grievance redressal, contact our designated officer:
            </p>
            <div className={styles.contactBox}>
              <p><strong>Legal Entity / FBO:</strong> VENIGALLA THUSHITHA (Trade Name: BAKE FACTORY)</p>
              <p><strong>FSSAI Registration No:</strong> 20126141002411 (Govt. of Andhra Pradesh)</p>
              <p><strong>Registered Address:</strong> Bake Factory, #12-1/2, Near Rohan&apos;s Pride Appartments, Amaravathi Road, Undavalli (Rural), Tadepalle, Guntur, Andhra Pradesh &ndash; 522501, India</p>
              <p><strong>Support Email:</strong> <a href="mailto:officialbakefactory@gmail.com">officialbakefactory@gmail.com</a></p>
              <p><strong>Hotline:</strong> <a href="tel:+917989499446">+91 79894 99446</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
