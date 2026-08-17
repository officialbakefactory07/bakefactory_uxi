"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  ChefHat,
  Truck,
  CircleCheckBig,
} from 'lucide-react';
import styles from './page.module.css';

interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
}

interface Order {
  id: string;
  userEmail?: string;
  items?: OrderItem[];
  totalPrice?: number;
  status?: string;
  createdAt?: any;
  address?: string;
  contact?: string;
  specialInstructions?: string;
}

const STATUS_OPTIONS = [
  'Preparing',
  'Cooking',
  'Out for delivery',
  'Completed',
  'Cancelled',
] as const;

type StatusType = (typeof STATUS_OPTIONS)[number];

const STATUS_CONFIG: Record<StatusType, { color: string; bg: string; icon: React.ElementType }> = {
  Preparing: { color: '#5d4037', bg: 'rgba(93,64,55,0.1)', icon: Package },
  Cooking: { color: '#e65100', bg: 'rgba(230,81,0,0.1)', icon: ChefHat },
  'Out for delivery': { color: '#1565c0', bg: 'rgba(21,101,192,0.1)', icon: Truck },
  Completed: { color: '#2e7d32', bg: 'rgba(46,125,50,0.1)', icon: CircleCheckBig },
  Cancelled: { color: '#c62828', bg: 'rgba(198,40,40,0.1)', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time orders listener
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: Order[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Order);
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

  // Compute stats
  const totalOrders = orders.length;
  const pendingCount = orders.filter(
    (o) => o.status === 'Preparing' || o.status === 'Cooking'
  ).length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (currentOrder && currentOrder.status === 'Cancelled') {
      alert('This order was cancelled by the customer and its status cannot be modified.');
      return;
    }
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const getStatusStyle = (status?: string): { color: string; bg: string } => {
    if (status && status in STATUS_CONFIG) {
      const cfg = STATUS_CONFIG[status as StatusType];
      return { color: cfg.color, bg: cfg.bg };
    }
    return { color: '#555', bg: 'rgba(0,0,0,0.05)' };
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '—';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>
            Manage and track all customer orders in real-time
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(212,160,23,0.12)' }}>
            <ShoppingCart size={20} color="var(--color-button)" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalOrders}</span>
            <span className={styles.statLabel}>Total Orders</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(230,81,0,0.1)' }}>
            <Clock size={20} color="#e65100" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{pendingCount}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(46,125,50,0.1)' }}>
            <CheckCircle2 size={20} color="#2e7d32" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{completedCount}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(198,40,40,0.1)' }}>
            <XCircle size={20} color="#c62828" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{cancelledCount}</span>
            <span className={styles.statLabel}>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>All Orders</h2>
          <span className={styles.orderCount}>{totalOrders} orders</span>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingCart size={48} color="#ccc" />
            <p>No orders yet. They&apos;ll appear here in real-time!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    return (
                      <tr key={order.id}>
                        <td>
                          <span className={styles.orderId}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={styles.orderDate}>
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.customerEmail}>
                            {order.userEmail || '—'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.itemsList}>
                            {order.items?.map((item, i) => (
                              <span key={i} className={styles.itemChip}>
                                {item.quantity}× {item.name}
                              </span>
                            )) || '—'}
                          </div>
                        </td>
                        <td>
                          <span className={styles.totalPrice}>
                            ₹{(order.totalPrice ?? 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={styles.statusBadge}
                            style={{
                              color: statusStyle.color,
                              background: statusStyle.bg,
                            }}
                          >
                            {order.status || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          {order.status === 'Cancelled' ? (
                            <span className={styles.cancelledDisabledTag} title="Customer cancelled this order. Status cannot be modified.">
                              🚫 Cancelled (Locked)
                            </span>
                          ) : (
                            <select
                              className={styles.statusSelect}
                              value={order.status || ''}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              style={{
                                borderColor: statusStyle.color,
                                color: statusStyle.color,
                              }}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className={styles.mobileCards}>
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <div key={order.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardHead}>
                      <div>
                        <span className={styles.orderId}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={styles.orderDate}>
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <span className={styles.totalPrice}>
                        ₹{(order.totalPrice ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.mobileCardBody}>
                      <div className={styles.mobileRow}>
                        <span className={styles.mobileLabel}>Customer</span>
                        <span className={styles.customerEmail}>
                          {order.userEmail || '—'}
                        </span>
                      </div>
                      <div className={styles.mobileRow}>
                        <span className={styles.mobileLabel}>Items</span>
                        <div className={styles.itemsList}>
                          {order.items?.map((item, i) => (
                            <span key={i} className={styles.itemChip}>
                              {item.quantity}× {item.name}
                            </span>
                          )) || '—'}
                        </div>
                      </div>
                      <div className={styles.mobileRow}>
                        <span className={styles.mobileLabel}>Status</span>
                        <span
                          className={styles.statusBadge}
                          style={{
                            color: statusStyle.color,
                            background: statusStyle.bg,
                          }}
                        >
                          {order.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.mobileCardFoot}>
                      <label>Update Status:</label>
                      {order.status === 'Cancelled' ? (
                        <span className={styles.cancelledDisabledTag} title="Customer cancelled this order. Status cannot be modified.">
                          🚫 Cancelled (Locked)
                        </span>
                      ) : (
                        <select
                          className={styles.statusSelect}
                          value={order.status || ''}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          style={{
                            borderColor: statusStyle.color,
                            color: statusStyle.color,
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
