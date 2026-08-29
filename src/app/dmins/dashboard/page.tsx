"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { IndianRupee, ShoppingBag, Banknote, Smartphone, TrendingUp, Printer, ArrowUpRight, Sparkles } from 'lucide-react';
import styles from './page.module.css';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  totalPrice?: number;
  total?: number;
  items: OrderItem[];
  createdAt: any;
  status: string;
  paymentMethod?: string;
  source?: string;
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
  const [onlineOrders, setOnlineOrders] = useState<Order[]>([]);
  const [posOrders, setPosOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Real-time online web orders listener
  useEffect(() => {
    const qOnline = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOnline = onSnapshot(qOnline, (snap) => {
      const data: Order[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        data.push({ id: doc.id, ...d, source: 'ONLINE' } as Order);
      });
      setOnlineOrders(data);
    }, (err) => {
      console.error("Firestore online orders error:", err);
    });

    // 2. Real-time POS in-store orders listener
    const qPos = query(collection(db, 'pos_orders'), orderBy('createdAt', 'desc'));
    const unsubPos = onSnapshot(qPos, (snap) => {
      const data: Order[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        data.push({ id: doc.id, ...d, totalPrice: d.total, source: 'POS' } as Order);
      });
      setPosOrders(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore pos orders error:", err);
      setLoading(false);
    });

    return () => {
      unsubOnline();
      unsubPos();
    };
  }, []);

  // Combined orders pool
  const allOrders = useMemo(() => {
    return [...onlineOrders, ...posOrders];
  }, [onlineOrders, posOrders]);

  // Compute today's stats across online + POS
  const todayStats = useMemo(() => {
    let sales = 0;
    let count = 0;
    let cash = 0;
    let upi = 0;
    let posCount = 0;
    let onlineCount = 0;

    allOrders.forEach((order) => {
      const orderDate = order.createdAt?.toDate
        ? order.createdAt.toDate()
        : new Date(order.createdAt || Date.now());
      
      if (isToday(orderDate)) {
        const orderAmt = order.totalPrice || order.total || 0;
        sales += orderAmt;
        count++;

        if (order.source === 'POS') posCount++;
        else onlineCount++;

        if (order.paymentMethod === 'Cash') cash += orderAmt;
        if (order.paymentMethod === 'UPI' || order.paymentMethod === 'Online') upi += orderAmt;
      }
    });

    return { sales, count, cash, upi, posCount, onlineCount };
  }, [allOrders]);

  // Top selling items
  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; count: number; price: number }>();
    allOrders.forEach((order) => {
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
  }, [allOrders]);

  // 7-day combined revenue data
  const revenueData = useMemo(() => {
    const days: { key: string; label: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      days.push({ key, label: getDayLabel(key), revenue: 0 });
    }
    allOrders.forEach((order) => {
      const orderDate = order.createdAt?.toDate
        ? order.createdAt.toDate()
        : new Date(order.createdAt || Date.now());
      const key = getDateKey(orderDate);
      const day = days.find((d) => d.key === key);
      if (day) {
        day.revenue += order.totalPrice || order.total || 0;
      }
    });
    return days;
  }, [allOrders]);

  const maxRevenue = useMemo(() => {
    return Math.max(...revenueData.map((d) => d.revenue), 1);
  }, [revenueData]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading master dashboard…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      
      {/* Top Banner / Fast POS Launcher */}
      <div className={styles.posBanner}>
        <div className={styles.posBannerText}>
          <Sparkles size={20} className={styles.sparkleIcon} />
          <div>
            <strong>Point of Sale & Billing Terminal Active</strong>
            <span>Cashier billing, Bluetooth 58mm/80mm receipt printing and live shift reports enabled.</span>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <Link href="/pos" target="_blank" className={styles.bannerPosBtn}>
            <Printer size={16} /> Open POS Terminal <ArrowUpRight size={16} />
          </Link>
          <Link href="/dmins/dashboard/pos-sales" className={styles.bannerSalesBtn}>
            Daily Sales Log
          </Link>
        </div>
      </div>

      {/* Page Title */}
      <h1 className={styles.pageTitle}>Admin Overview</h1>

      {/* Daily Sales Overview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Combined Today&apos;s Sales (Online + Store POS)</h2>
        <div className={styles.statsGrid}>
          
          {/* Today's Sales */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconSales}`}>
              <IndianRupee size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>TODAY&apos;S TOTAL REVENUE</span>
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
              <span className={styles.statLabel}>TOTAL ORDERS</span>
              <span className={styles.statValue}>{todayStats.count} <small>({todayStats.posCount} POS, {todayStats.onlineCount} Web)</small></span>
            </div>
          </div>

          {/* Cash In Drawer */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconCash}`}>
              <Banknote size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>CASH IN DRAWER</span>
              <span className={styles.statValue}>₹{todayStats.cash.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* UPI / Digital */}
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconOnline}`}>
              <Smartphone size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>UPI / DIGITAL SETTLED</span>
              <span className={styles.statValue}>₹{todayStats.upi.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 7-Day Revenue Chart */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7-Day Revenue Trend (₹)</h2>
        <div className={styles.chartCard}>
          <div className={styles.barChart}>
            {revenueData.map((d) => {
              const heightPct = (d.revenue / maxRevenue) * 100;
              return (
                <div key={d.key} className={styles.barCol}>
                  <span className={styles.barValue}>
                    {d.revenue > 0 ? `₹${d.revenue.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                  <span className={styles.barLabel}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Selling Items & Recent Feed Split */}
      <div className={styles.splitGrid}>
        
        {/* Top Selling Items */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Selling Items</h2>
          <div className={styles.topItemsCard}>
            {topItems.length === 0 ? (
              <p className={styles.emptyText}>No sales recorded yet.</p>
            ) : (
              <ul className={styles.topItemList}>
                {topItems.map((item, index) => (
                  <li key={item.name} className={styles.topItemRow}>
                    <span className={styles.topItemRank}>#{index + 1}</span>
                    <span className={styles.topItemName}>{item.name}</span>
                    <span className={styles.topItemQty}>{item.count} sold</span>
                    <span className={styles.topItemPrice}>₹{(item.count * item.price).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Recent Combined Activity */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Orders Activity</h2>
          <div className={styles.topItemsCard}>
            <ul className={styles.topItemList}>
              {allOrders.slice(0, 6).map(order => (
                <li key={order.id} className={styles.topItemRow}>
                  <span className={order.source === 'POS' ? styles.badgePos : styles.badgeOnline}>
                    {order.source === 'POS' ? 'POS BILL' : 'WEB ORDER'}
                  </span>
                  <span className={styles.topItemName}>
                    {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ') || 'Order Details'}
                  </span>
                  <strong className={styles.topItemPrice}>
                    ₹{(order.totalPrice || order.total || 0).toLocaleString('en-IN')}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>

    </div>
  );
}
