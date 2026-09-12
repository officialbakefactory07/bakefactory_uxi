"use client";

import React from 'react';
import Link from 'next/link';
import { Truck, ChevronRight } from 'lucide-react';
import styles from '../terms/page.module.css';

export default function ShippingPolicyPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Truck size={16} />
            <span>SPEED & CARE</span>
          </div>
          <h1>Shipping & Delivery Policy</h1>
          <p>Last updated: September 12, 2026 &bull; Express bakery delivery across Vijayawada & Tadepalle</p>
        </div>
      </section>

      <div className={styles.contentWrap}>
        <div className={styles.card}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <ChevronRight size={14} />
            <span>Shipping & Delivery Policy</span>
          </div>

          <section className={styles.section}>
            <h2>1. Delivery Areas & Coverage</h2>
            <p>
              Bake Factory delivers freshly baked cakes, pastries, gourmet desserts, and combos across <strong>Vijayawada, Tadepalle, Mangalagiri, and surrounding areas</strong> in Andhra Pradesh (including PIN codes 522501, 520001, 520002, 520003, 520007, 520008, 520010, 522503, etc.).
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Delivery Timelines & Slots</h2>
            <p>We provide two convenient delivery modes:</p>
            <ul>
              <li><strong>Express Same-Day Delivery (45 &ndash; 60 Minutes):</strong> For all standard cakes, desserts, and cookies ordered during store operational hours (9:00 AM &ndash; 10:30 PM).</li>
              <li><strong>Scheduled & Midnight Delivery:</strong> Customers may pre-book deliveries for birthdays, anniversaries, or midnight surprises at a chosen date and time slot during checkout.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Delivery Charges</h2>
            <p>
              Delivery charges are calculated transparently during checkout based on the distance from our Tadepalle bakery studio:
            </p>
            <ul>
              <li><strong>Local Tadepalle Area:</strong> Standard local delivery fee / Free delivery on orders above ₹499.</li>
              <li><strong>Greater Vijayawada City:</strong> Nominal distance-based delivery fee (₹40 &ndash; ₹90) displayed clearly in your order summary before payment.</li>
              <li><strong>Store Pickup / Takeaway:</strong> 100% Free self-pickup from our studio counter near Rohan&apos;s Pride Apartments, Catholic Church Area, Tadepalle.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Safe Handling & Protective Packaging</h2>
            <p>
              Cakes are delicate. We utilize heavy-duty corrugated pastry boxes, supportive cake bases, and insulated temperature-controlled bags to guarantee that your cake arrives in pristine, chilled condition without slipping or melting.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Real-Time Order Tracking</h2>
            <p>
              Upon placing your order, you receive real-time email notifications and live order status tracking (<em>Order Placed ➔ In Preparation ➔ Out for Delivery ➔ Delivered</em>) on our website and in your account profile.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Delivery Inquiries & Support</h2>
            <p>If you need to update your delivery instructions or check on driver status:</p>
            <div className={styles.contactBox}>
              <p><strong>Bake Factory Dispatch Center</strong></p>
              <p>Hotline: <a href="tel:+917989499446">+91 79894 99446</a></p>
              <p>WhatsApp Support: +91 79894 99446</p>
              <p>Email: <a href="mailto:officialbakefactory@gmail.com">officialbakefactory@gmail.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
