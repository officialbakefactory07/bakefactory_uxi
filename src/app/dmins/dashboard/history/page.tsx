"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import styles from './page.module.css';

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    getDocs(q).then(snap => {
      const data: any[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setOrders(data);
    }).catch(() => setOrders([]));
  }, []);

  const completedOrders = orders.filter(o => o.status === 'Completed');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>History</h1>
      <p className={styles.subtitle}>Complete order history and records</p>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Records</span>
          <span className={styles.statValue}>{orders.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue} style={{ color: '#2e7d32' }}>{completedOrders.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Cancelled</span>
          <span className={styles.statValue} style={{ color: '#c62828' }}>{cancelledOrders.length}</span>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span>ORDER ID</span>
          <span>CUSTOMER</span>
          <span>ITEMS</span>
          <span>TOTAL</span>
          <span>STATUS</span>
          <span>DATE</span>
        </div>
        {orders.length === 0 ? (
          <p className={styles.empty}>No order history available.</p>
        ) : orders.map(order => (
          <div key={order.id} className={styles.tableRow}>
            <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
            <span>{order.userEmail || '—'}</span>
            <span className={styles.items}>
              {order.items?.map((i: any) => `${i.quantity}× ${i.name}`).join(', ') || '—'}
            </span>
            <span className={styles.price}>₹{order.totalPrice?.toFixed(0) || 0}</span>
            <span className={styles.statusBadge} data-status={order.status?.toLowerCase().replace(/ /g, '-')}>
              {order.status}
            </span>
            <span className={styles.date}>
              {order.createdAt?.seconds
                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
