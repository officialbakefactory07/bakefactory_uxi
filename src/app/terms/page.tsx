"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <ShieldCheck size={16} />
            <span>LEGAL & COMPLIANCE</span>
          </div>
          <h1>Terms & Conditions</h1>
          <p>Last updated: September 12, 2026 &bull; Effective for all Bake Factory orders and services</p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.contentWrap}>
        <div className={styles.card}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <ChevronRight size={14} />
            <span>Terms and Conditions</span>
          </div>

          <section className={styles.section}>
            <h2>1. Introduction & Company Information</h2>
            <p>
              Welcome to <strong>Bake Factory</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). We operate the artisanal bakery and online ordering portal at <Link href="/">https://bakefactory.in</Link>. Our bakery studio is located near Rohan&apos;s Pride Apartments, Catholic Church Area, Tadepalle, Vijayawada, Andhra Pradesh &ndash; 522501, India.
            </p>
            <p>
              By accessing our website, placing an order, or utilizing our POS counter and online delivery services, you agree to be bound by these Terms and Conditions and our Privacy Policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Products & Customization</h2>
            <p>
              All our cakes, pastries, gourmet desserts, and cookies are handcrafted fresh daily using premium food-grade ingredients.
            </p>
            <ul>
              <li><strong>Custom Designer & Fondant Cakes:</strong> Visual appearance, colors, and hand-molded cake toppers may vary slightly from reference photographs due to the artisanal nature of hand-baking.</li>
              <li><strong>Allergen Notice:</strong> Our kitchen processes wheat, dairy, nuts, and chocolate. Customers with severe allergies are advised to contact us at <strong>+91 79894 99446</strong> prior to ordering.</li>
              <li><strong>Weights & Portions:</strong> Indicated weights (e.g., 500g, 1kg) are approximate baked weights.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Pricing & Payments</h2>
            <p>
              All prices displayed on Bake Factory are in <strong>Indian Rupees (INR &ndash; ₹)</strong> and are inclusive of applicable taxes unless stated otherwise.
            </p>
            <ul>
              <li><strong>Payment Gateway:</strong> Online transactions are processed securely through certified RBI-authorized payment aggregators (including <strong>PayU Payments Private Limited</strong>).</li>
              <li><strong>Accepted Methods:</strong> UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery (COD) for eligible pin codes.</li>
              <li><strong>Transaction Security:</strong> We do not store credit card numbers, CVVs, or bank passwords on our servers. All sensitive financial information is encrypted with bank-grade 256-bit SSL protocols.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Order Acceptance & Fulfillment</h2>
            <p>
              An order is confirmed once payment is verified (for online orders) or order confirmation is acknowledged. We reserve the right to decline or cancel an order in the event of product unavailability, delivery zone constraints, or technical payment errors. In such cases, full refunds are processed immediately.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Intellectual Property</h2>
            <p>
              The Bake Factory logo, branding, product photography, dessert recipes, website graphics, and software code are the exclusive intellectual property of Bake Factory. Unauthorized duplication or distribution is prohibited.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with our services shall be subject to the exclusive jurisdiction of the competent courts in <strong>Vijayawada, Andhra Pradesh</strong>.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Contact & Grievance Officer</h2>
            <p>If you have any questions or grievances regarding our Terms & Conditions, please contact our support team:</p>
            <div className={styles.contactBox}>
              <p><strong>Bake Factory Customer Care</strong></p>
              <p>Address: Catholic Church Area, Tadepalle, Vijayawada &ndash; 522501, AP, India</p>
              <p>Hotline: <a href="tel:+917989499446">+91 79894 99446</a></p>
              <p>Email: <a href="mailto:officialbakefactory@gmail.com">officialbakefactory@gmail.com</a></p>
              <p>Operating Hours: 9:00 AM &ndash; 10:30 PM (All 7 Days)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
