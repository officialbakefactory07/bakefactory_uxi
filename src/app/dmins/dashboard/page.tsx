"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { IndianRupee, ShoppingBag, Banknote, Smartphone, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  totalPrice: number;
  items: OrderItem[];
  createdAt: any;
  status: string;
  paymentMethod?: string;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time orders listener
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: Order[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        data.push({ id: doc.id, ...d } as Order);
      });
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setOrders([]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute today's stats
  const todayStats = useMemo(() => {
    let sales = 0;
    let count = 0;
    orders.forEach((order) => {
      const orderDate = order.createdAt?.toDate
        ? order.createdAt.toDate()
        : new Date(order.createdAt);
      if (isToday(orderDate)) {
        sales += order.totalPrice || 0;
        count++;
      }
    });
    return { sales, count };
  }, [orders]);

  // Top selling items (all time, aggregated)
  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; count: number; price: number }>();
    orders.forEach((order) => {
      if (!order.items) return;
      order.items.forEach((item) => {
        const existing = map.get(item.name);
        if (existing) {
          existing.count += item.quantity || 1;
        } else {
          map.set(item.name, {
            name: item.name,
            count: item.quantity || 1,
            price: item.price || 0,
          });
        }
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  // 7-day revenue data
  const revenueData = useMemo(() => {
    const days: { key: string; label: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      days.push({ key, label: getDayLabel(key), revenue: 0 });
    }
    orders.forEach((order) => {
      const orderDate = order.createdAt?.toDate
        ? order.createdAt.toDate()
        : new Date(order.createdAt);
      const key = getDateKey(orderDate);
      const day = days.find((d) => d.key === key);
      if (day) {
        day.revenue += order.totalPrice || 0;
      }
    });
    return days;
  }, [orders]);

  const maxRevenue = useMemo(() => {
    return Math.max(...revenueData.map((d) => d.revenue), 1);
  }, [revenueData]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Page Title */}
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* Daily Sales Overview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Daily Sales Overview</h2>
        <div className={styles.statsGrid}>
          {/* Today's Sales */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconSales}`}>
              <IndianRupee size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>TODAY&apos;S SALES</span>
              <span className={styles.statValue}>
                ₹{todayStats.sales.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Orders */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconOrders}`}>
              <ShoppingBag size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>ORDERS</span>
              <span className={styles.statValue}>{todayStats.count}</span>
            </div>
          </div>

          {/* Cash */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconCash}`}>
              <Banknote size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>CASH</span>
              <span className={styles.statValue}>₹0</span>
            </div>
          </div>

          {/* Online */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconOnline}`}>
              <Smartphone size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>ONLINE</span>
              <span className={styles.statValue}>₹0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Two Columns */}
      <div className={styles.bottomGrid}>
        {/* Left: Top Selling Items */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Top Selling Items</h2>
          {topItems.length === 0 ? (
            <p className={styles.emptyMsg}>No order data yet.</p>
          ) : (
            <div className={styles.topItemsList}>
              {topItems.map((item, index) => (
                <div key={item.name} className={styles.topItem}>
                  <span className={styles.topItemRank}>{index + 1}</span>
                  <div className={styles.topItemInfo}>
                    <span className={styles.topItemName}>{item.name}</span>
                    <span className={styles.topItemMeta}>
                      {item.count} sold &bull; ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className={styles.topItemCount}>{item.count}×</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: 7-Day Revenue Chart */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>7-Day Revenue</h2>
            <TrendingUp size={20} className={styles.trendIcon} />
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chartBars}>
              {revenueData.map((day) => (
                <div key={day.key} className={styles.chartCol}>
                  <span className={styles.chartValue}>
                    {day.revenue > 0 ? `₹${Math.round(day.revenue).toLocaleString('en-IN')}` : ''}
                  </span>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}%`,
                      }}
                    />
                  </div>
                  <span className={styles.chartLabel}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
