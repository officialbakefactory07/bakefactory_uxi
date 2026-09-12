"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle2, ShoppingBag, Clock, MapPin, ArrowRight, ShieldCheck, Sparkles, ChefHat } from 'lucide-react';
import styles from './page.module.css';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Success Icon Badge */}
        <div className={styles.iconCircle}>
          <CheckCircle2 size={44} className={styles.checkIcon} />
        </div>

        <span className={styles.badge}>
          <Sparkles size={14} />
          <span>PAYMENT VERIFIED & CONFIRMED</span>
        </span>

        <h1 className={styles.title}>Thank You For Your Order!</h1>
        <p className={styles.subtitle}>
          Your order has been received and our master bakers are now handcrafting your treats with love.
        </p>

        {/* Order Meta Box */}
        <div className={styles.metaBox}>
          <div className={styles.metaRow}>
            <span>Order Reference:</span>
            <strong>#{orderId || 'BF-ORD'}</strong>
          </div>
          {order?.paymentStatus && (
            <div className={styles.metaRow}>
              <span>Payment Status:</span>
              <span className={styles.paidBadge}>{order.paymentStatus}</span>
            </div>
          )}
          {order?.payuPaymentId && (
            <div className={styles.metaRow}>
              <span>PayU Transaction ID:</span>
              <span className={styles.txnId}>{order.payuPaymentId}</span>
            </div>
          )}
          {order?.total && (
            <div className={styles.metaRow}>
              <span>Amount Paid:</span>
              <strong className={styles.totalPrice}>₹{order.total.toFixed(0)}</strong>
            </div>
          )}
        </div>

        {/* Live Tracking Progress */}
        <div className={styles.trackingSection}>
          <h3 className={styles.sectionTitle}>
            <ChefHat size={18} />
            <span>Order Progress</span>
          </h3>
          <div className={styles.trackerSteps}>
            <div className={`${styles.step} ${styles.stepActive}`}>
              <div className={styles.stepDot} />
              <span>Order Received</span>
            </div>
            <div className={`${styles.step} ${styles.stepActive}`}>
              <div className={styles.stepDot} />
              <span>Baking Fresh</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepDot} />
              <span>Out for Delivery</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepDot} />
              <span>Delivered</span>
            </div>
          </div>
        </div>

        {/* Items Summary if available */}
        {order?.items && order.items.length > 0 && (
          <div className={styles.itemsSection}>
            <h4 className={styles.itemsTitle}>Items in this Order</h4>
            <div className={styles.itemList}>
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className={styles.itemRow}>
                  <div>
                    <strong>{item.name}</strong> × {item.quantity}
                    {item.note && <div className={styles.itemNote}>↳ {item.note}</div>}
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Note */}
        <div className={styles.deliveryNote}>
          <Clock size={16} />
          <span>Estimated Delivery: <strong>45 – 60 Minutes</strong> (Fresh from our Tadepalle Studio)</span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/profile" className={styles.profileBtn}>
            <span>View Order in My Account</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/menu" className={styles.menuBtn}>
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Trust badge */}
        <div className={styles.trustFooter}>
          <ShieldCheck size={16} />
          <span>Secure PayU Encrypted Transaction &bull; 100% Quality Guaranteed</span>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
