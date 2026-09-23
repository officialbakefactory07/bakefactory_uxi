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
            <h2>1. Introduction, Legal Entity &amp; FSSAI Registration</h2>
            <p>
              Welcome to <strong>Bake Factory</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;). The website <Link href="/">https://bakefactory.in</Link> is owned and operated by the registered Food Business Operator (FBO) <strong>VENIGALLA THUSHITHA (Trade Name: BAKE FACTORY)</strong>, operating under Government of Andhra Pradesh <strong>FSSAI Registration No. 20126141002411</strong>.
            </p>
            <p>
              Our registered food business premises address is: <strong>Bake Factory, #12-1/2, Near Rohan&apos;s Pride Appartments, Amaravathi Road, Undavalli (Rural), Tadepalle, Guntur, Andhra Pradesh &ndash; 522501, India</strong>.
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
              <li><strong>Payment Gateways:</strong> Online transactions are processed securely through certified RBI-authorized payment aggregators (including <strong>Razorpay Software Private Limited</strong> and <strong>PayU Payments Private Limited</strong>).</li>
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
            <h2>7. Contact & Grievance Redressal</h2>
            <p>If you have any questions, inquiries, or grievances regarding our Terms & Conditions or order fulfillment, please contact our support team:</p>
            <div className={styles.contactBox}>
              <p><strong>Legal Entity / FBO:</strong> VENIGALLA THUSHITHA (Trade Name: BAKE FACTORY)</p>
              <p><strong>FSSAI Registration No:</strong> 20126141002411 (Govt. of Andhra Pradesh)</p>
              <p><strong>Registered Address:</strong> Bake Factory, #12-1/2, Near Rohan&apos;s Pride Appartments, Amaravathi Road, Undavalli (Rural), Tadepalle, Guntur, Andhra Pradesh &ndash; 522501, India</p>
              <p><strong>Customer Care Hotline:</strong> <a href="tel:+917989499446">+91 79894 99446</a></p>
              <p><strong>Official Email:</strong> <a href="mailto:officialbakefactory@gmail.com">officialbakefactory@gmail.com</a></p>
              <p><strong>Operating Hours:</strong> 9:00 AM &ndash; 10:30 PM (Mon &ndash; Sun)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
