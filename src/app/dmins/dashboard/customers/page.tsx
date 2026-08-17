"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Users, Repeat, Percent, IndianRupee, Crown } from 'lucide-react';
import styles from './page.module.css';

interface CustomerData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

const AVATAR_COLORS = [
  '#D4A017', '#B8860B', '#5C2F0E', '#2e7d32',
  '#1565c0', '#6a1b9a', '#c62828', '#00838f',
  '#ef6c00', '#4e342e',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders')),
        ]);

        // Build order aggregation per userId
        const orderAgg: Record<string, { count: number; totalSpent: number; lastDate: Date | null }> = {};

        ordersSnap.forEach((doc) => {
          const data = doc.data();
          const userId = data.userId || data.uid || '';
          if (!userId) return;

          if (!orderAgg[userId]) {
            orderAgg[userId] = { count: 0, totalSpent: 0, lastDate: null };
          }

          orderAgg[userId].count += 1;
          orderAgg[userId].totalSpent += data.totalPrice || 0;

          // Parse date from createdAt
          let orderDate: Date | null = null;
          if (data.createdAt) {
            if (data.createdAt.toDate) {
              orderDate = data.createdAt.toDate();
            } else if (typeof data.createdAt === 'string') {
              orderDate = new Date(data.createdAt);
            } else if (data.createdAt.seconds) {
              orderDate = new Date(data.createdAt.seconds * 1000);
            }
          }

          if (orderDate && (!orderAgg[userId].lastDate || orderDate > orderAgg[userId].lastDate)) {
            orderAgg[userId].lastDate = orderDate;
          }
        });

        // Build customer list from users collection
        const customerList: CustomerData[] = [];
        usersSnap.forEach((doc) => {
          const data = doc.data();
          const agg = orderAgg[doc.id] || { count: 0, totalSpent: 0, lastDate: null };
          customerList.push({
            id: doc.id,
            fullName: data.fullName || data.name || data.displayName || 'Unknown',
            phone: data.phone || data.phoneNumber || '—',
            email: data.email || '—',
            orderCount: agg.count,
            totalSpent: agg.totalSpent,
            lastOrderDate: agg.lastDate,
          });
        });

        // Sort by total spent descending
        customerList.sort((a, b) => b.totalSpent - a.totalSpent);
        setCustomers(customerList);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Computed stats
  const stats = useMemo(() => {
    const total = customers.length;
    const repeat = customers.filter((c) => c.orderCount >= 2).length;
    const repeatPercent = total > 0 ? Math.round((repeat / total) * 100) : 0;
    const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
    const avgOrder = totalOrders > 0 ? Math.round(totalSpentAll / totalOrders) : 0;
    return { total, repeat, repeatPercent, avgOrder };
  }, [customers]);

  // Top 3 frequent customers (by order count)
  const frequentCustomers = useMemo(() => {
    return [...customers]
      .filter((c) => c.orderCount > 0)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 3);
  }, [customers]);

  // Frequent customer IDs set for badge display
  const frequentIds = useMemo(() => {
    return new Set(frequentCustomers.map((c) => c.id));
  }, [frequentCustomers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSubtitle}>
            Manage and view all customer data and order history
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(21, 101, 192, 0.1)', color: '#1565c0' }}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32' }}>
            <Repeat size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>REPEAT</span>
            <span className={styles.statValue}>{stats.repeat}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(106, 27, 154, 0.1)', color: '#6a1b9a' }}>
            <Percent size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>REPEAT %</span>
            <span className={styles.statValue}>{stats.repeatPercent}%</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(212, 160, 23, 0.1)', color: 'var(--color-button)' }}>
            <IndianRupee size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>AVG ORDER</span>
            <span className={styles.statValue}>{formatCurrency(stats.avgOrder)}</span>
          </div>
        </div>
      </div>

      {/* Frequent Customers Highlight */}
      {frequentCustomers.length > 0 && (
        <div className={styles.frequentSection}>
          <div className={styles.frequentHeader}>
            <Crown size={20} />
            <h2>Frequent Customers</h2>
          </div>
          <div className={styles.frequentGrid}>
            {frequentCustomers.map((customer, index) => (
              <div key={customer.id} className={styles.frequentCard}>
                <div className={styles.frequentRank}>#{index + 1}</div>
                <div
                  className={styles.frequentAvatar}
                  style={{ background: getAvatarColor(customer.fullName) }}
                >
                  {customer.fullName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.frequentInfo}>
                  <strong>{customer.fullName}</strong>
                  <span>{customer.orderCount} orders · {formatCurrency(customer.totalSpent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <span className={styles.searchCount}>
            {filteredCustomers.length} result{filteredCustomers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Customers Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  {searchQuery ? 'No customers match your search.' : 'No customers found.'}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.customerCell}>
                      <div
                        className={styles.avatar}
                        style={{ background: getAvatarColor(customer.fullName) }}
                      >
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.customerName}>
                        <span>{customer.fullName}</span>
                        {frequentIds.has(customer.id) && (
                          <span className={styles.frequentBadge}>
                            <Crown size={11} />
                            FREQUENT
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span className={styles.contactPhone}>{customer.phone}</span>
                      <span className={styles.contactEmail}>{customer.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.orderCount}>{customer.orderCount}</span>
                  </td>
                  <td>
                    <span className={styles.spentAmount}>{formatCurrency(customer.totalSpent)}</span>
                  </td>
                  <td>
                    <span className={styles.lastOrder}>{formatDate(customer.lastOrderDate)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
