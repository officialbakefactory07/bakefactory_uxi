"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  IndianRupee,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Timer,
  TrendingUp,
  BarChart3,
  Trophy,
  Calendar,
} from 'lucide-react';
import styles from './page.module.css';

interface OrderItem {
  name: string;
  category?: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: string;
  totalPrice?: number;
  status?: string;
  createdAt?: any;
  userEmail?: string;
  items?: OrderItem[];
}

type Period = 'day' | 'week' | 'month' | 'year';

function getOrderDate(order: Order): Date | null {
  if (!order.createdAt) return null;
  if (order.createdAt.toDate) return order.createdAt.toDate();
  if (order.createdAt.seconds) return new Date(order.createdAt.seconds * 1000);
  const d = new Date(order.createdAt);
  return isNaN(d.getTime()) ? null : d;
}

function isSamePeriod(date: Date, ref: Date, period: Period): boolean {
  switch (period) {
    case 'day':
      return (
        date.getFullYear() === ref.getFullYear() &&
        date.getMonth() === ref.getMonth() &&
        date.getDate() === ref.getDate()
      );
    case 'week': {
      const startOfWeek = new Date(ref);
      startOfWeek.setDate(ref.getDate() - ref.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return date >= startOfWeek && date < endOfWeek;
    }
    case 'month':
      return (
        date.getFullYear() === ref.getFullYear() &&
        date.getMonth() === ref.getMonth()
      );
    case 'year':
      return date.getFullYear() === ref.getFullYear();
  }
}

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [period, setPeriod] = useState<Period>('month');

  // Fetch orders once
  useEffect(() => {
    async function fetchOrders() {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const orders: Order[] = [];
        snap.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setAllOrders(orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Filter orders by selected date + period
  const filtered = useMemo(() => {
    const ref = new Date(selectedDate + 'T00:00:00');
    return allOrders.filter((o) => {
      const d = getOrderDate(o);
      return d ? isSamePeriod(d, ref, period) : false;
    });
  }, [allOrders, selectedDate, period]);

  // ---- Computed analytics ----
  const totalRevenue = useMemo(
    () => filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    [filtered]
  );

  const totalOrders = filtered.length;

  const statusCounts = useMemo(() => {
    const counts = { completed: 0, pending: 0, cancelled: 0 };
    filtered.forEach((o) => {
      const s = (o.status || '').toLowerCase();
      if (s === 'completed' || s === 'delivered') counts.completed++;
      else if (s === 'cancelled' || s === 'rejected') counts.cancelled++;
      else counts.pending++;
    });
    return counts;
  }, [filtered]);

  // Repeat customers
  const repeatCustomerPct = useMemo(() => {
    const emailCounts: Record<string, number> = {};
    filtered.forEach((o) => {
      if (o.userEmail) {
        emailCounts[o.userEmail] = (emailCounts[o.userEmail] || 0) + 1;
      }
    });
    const emails = Object.values(emailCounts);
    if (emails.length === 0) return 0;
    const repeats = emails.filter((c) => c > 1).length;
    return Math.round((repeats / emails.length) * 100);
  }, [filtered]);

  // Peak order time
  const peakOrderTime = useMemo(() => {
    const hourBuckets: Record<number, number> = {};
    filtered.forEach((o) => {
      const d = getOrderDate(o);
      if (d) {
        const h = d.getHours();
        hourBuckets[h] = (hourBuckets[h] || 0) + 1;
      }
    });
    let maxH = 0;
    let maxCount = 0;
    Object.entries(hourBuckets).forEach(([h, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxH = parseInt(h, 10);
      }
    });
    if (maxCount === 0) return 'N/A';
    const formatH = (h: number) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const hr = h % 12 || 12;
      return `${hr}:00 ${suffix}`;
    };
    return `${formatH(maxH)} - ${formatH((maxH + 1) % 24)}`;
  }, [filtered]);

  // 7-day trend data (last 7 days from selectedDate)
  const trendData = useMemo(() => {
    const ref = new Date(selectedDate + 'T23:59:59');
    const days: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(ref);
      day.setDate(ref.getDate() - i);
      const dayStr = day.toISOString().split('T')[0];
      const dayLabel = DAY_LABELS[day.getDay()];
      let revenue = 0;
      let orders = 0;
      allOrders.forEach((o) => {
        const d = getOrderDate(o);
        if (d) {
          const oStr = d.toISOString().split('T')[0];
          if (oStr === dayStr) {
            revenue += o.totalPrice || 0;
            orders++;
          }
        }
      });
      days.push({ label: dayLabel, revenue, orders });
    }
    return days;
  }, [allOrders, selectedDate]);

  const maxTrendRevenue = useMemo(
    () => Math.max(...trendData.map((d) => d.revenue), 1),
    [trendData]
  );

  // Category-wise sales
  const categorySales = useMemo(() => {
    const cats: Record<string, number> = {};
    filtered.forEach((o) => {
      o.items?.forEach((item) => {
        const cat = item.category || 'Other';
        cats[cat] = (cats[cat] || 0) + (item.price || 0) * (item.quantity || 1);
      });
    });
    const total = Object.values(cats).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(cats)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: Math.round((amount / total) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  // Top selling items
  const topItems = useMemo(() => {
    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    filtered.forEach((o) => {
      o.items?.forEach((item) => {
        const key = item.name || 'Unknown';
        if (!itemMap[key]) itemMap[key] = { name: key, qty: 0, revenue: 0 };
        itemMap[key].qty += item.quantity || 1;
        itemMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filtered]);

  const CATEGORY_COLORS: Record<string, string> = {
    Cakes: '#D4A017',
    Snacks: '#e67e22',
    Desserts: '#e74c3c',
    Other: '#8e44ad',
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>
            Analytics Dashboard – Premium real-time insights &amp; reporting
          </p>
        </div>
        <div className={styles.filters}>
          <div className={styles.dateInput}>
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className={styles.periodTabs}>
            {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                className={`${styles.periodTab} ${period === p ? styles.periodActive : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 1: 5 stat cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGold}`}>
            <IndianRupee size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL REVENUE</span>
            <span className={styles.statValue}>{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <ShoppingCart size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL ORDERS</span>
            <span className={styles.statValue}>{totalOrders}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>COMPLETED</span>
            <span className={styles.statValue}>{statusCounts.completed}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconOrange}`}>
            <Clock size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>PENDING</span>
            <span className={styles.statValue}>{statusCounts.pending}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconRed}`}>
            <XCircle size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>CANCELLED</span>
            <span className={styles.statValue}>{statusCounts.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Row 2: 2 stat cards */}
      <div className={styles.statsRowSmall}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>REPEAT CUSTOMERS</span>
            <span className={styles.statValue}>{repeatCustomerPct}%</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconTeal}`}>
            <Timer size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>PEAK ORDER TIME</span>
            <span className={styles.statValue}>{peakOrderTime}</span>
          </div>
        </div>
      </div>

      {/* Sales & Orders Trend */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <TrendingUp size={20} />
          <h2>SALES &amp; ORDERS TREND</h2>
          <span className={styles.cardBadge}>Last 7 Days</span>
        </div>
        <div className={styles.chartWrap}>
          {trendData.map((d, i) => (
            <div className={styles.chartCol} key={i}>
              <span className={styles.chartValue}>
                {d.revenue > 0 ? formatCurrency(d.revenue) : '–'}
              </span>
              <div className={styles.chartBarOuter}>
                <div
                  className={styles.chartBar}
                  style={{ height: `${(d.revenue / maxTrendRevenue) * 100}%` }}
                />
              </div>
              <span className={styles.chartLabel}>{d.label}</span>
              <span className={styles.chartOrders}>
                {d.orders} order{d.orders !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: Category + Top Items */}
      <div className={styles.bottomRow}>
        {/* Category-wise Sales */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <BarChart3 size={20} />
            <h2>CATEGORY-WISE SALES</h2>
          </div>
          {categorySales.length === 0 ? (
            <p className={styles.emptyMsg}>No category data available for this period.</p>
          ) : (
            <div className={styles.categoryList}>
              {categorySales.map((cat) => (
                <div className={styles.categoryItem} key={cat.name}>
                  <div className={styles.categoryTop}>
                    <span
                      className={styles.categoryDot}
                      style={{
                        backgroundColor: CATEGORY_COLORS[cat.name] || '#888',
                      }}
                    />
                    <span className={styles.categoryName}>{cat.name}</span>
                    <span className={styles.categoryPct}>{cat.pct}%</span>
                    <span className={styles.categoryAmt}>
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${cat.pct}%`,
                        backgroundColor: CATEGORY_COLORS[cat.name] || '#888',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Trophy size={20} />
            <h2>TOP SELLING ITEMS</h2>
          </div>
          {topItems.length === 0 ? (
            <p className={styles.emptyMsg}>No items data available for this period.</p>
          ) : (
            <div className={styles.topItemsList}>
              {topItems.map((item, i) => (
                <div className={styles.topItem} key={item.name}>
                  <span className={styles.topRank}>#{i + 1}</span>
                  <div className={styles.topItemInfo}>
                    <span className={styles.topItemName}>{item.name}</span>
                    <span className={styles.topItemMeta}>
                      {item.qty} sold · {formatCurrency(item.revenue)}
                    </span>
                  </div>
                  <span className={styles.topItemQty}>{item.qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
