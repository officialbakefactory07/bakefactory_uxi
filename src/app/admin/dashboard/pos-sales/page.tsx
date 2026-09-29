"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  Banknote, QrCode, CreditCard, ShoppingCart, Calendar, 
  Search, Printer, Download, Eye, FileText, TrendingUp, Sparkles, Filter
} from 'lucide-react';
import { ReceiptData } from '@/lib/escpos';
import { ReceiptModal } from '@/components/POS/ReceiptModal';
import styles from './page.module.css';

export default function PosSalesDashboard() {
  const [posOrders, setPosOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);

  // Real-time listener for POS Orders
  useEffect(() => {
    const q = query(collection(db, 'pos_orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPosOrders(list);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching POS orders for admin:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filter orders by date & payment mode
  const filteredOrders = useMemo(() => {
    return posOrders.filter(order => {
      // Date matching (comparing dateStr or createdAt timestamp)
      let matchDate = true;
      if (selectedDate) {
        const orderDateObj = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
        const formattedOrderDate = orderDateObj.toISOString().split('T')[0];
        matchDate = formattedOrderDate === selectedDate;
      }

      const matchPayment = paymentFilter === 'All' || order.paymentMethod === paymentFilter;

      const matchQuery = !searchQuery.trim() || 
        order.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone?.includes(searchQuery);

      return matchDate && matchPayment && matchQuery;
    });
  }, [posOrders, selectedDate, paymentFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let grossSales = 0;
    let totalBills = filteredOrders.length;
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    const itemCounts: Record<string, number> = {};

    filteredOrders.forEach(o => {
      const amt = o.total || 0;
      grossSales += amt;
      if (o.paymentMethod === 'Cash') cashSales += amt;
      if (o.paymentMethod === 'UPI') upiSales += amt;
      if (o.paymentMethod === 'Card') cardSales += amt;

      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          const name = item.name || 'Unknown';
          itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
        });
      }
    });

    const avgBill = totalBills > 0 ? Math.round(grossSales / totalBills) : 0;

    // Top selling items
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      grossSales,
      totalBills,
      cashSales,
      upiSales,
      cardSales,
      avgBill,
      topItems
    };
  }, [filteredOrders]);

  const handleReprintReceipt = (order: any) => {
    const receiptData: ReceiptData = {
      invoiceNumber: order.invoiceNumber || '000000',
      orderType: order.orderType || 'Takeaway',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items || [],
      subtotal: order.subtotal || order.total,
      discount: order.discount || 0,
      total: order.total,
      paymentMethod: order.paymentMethod || 'Cash',
      cashReceived: order.cashReceived,
      changeDue: order.changeDue,
      cashierName: order.cashierName || 'Admin',
      dateStr: order.dateStr,
      timeStr: order.timeStr
    };
    setActiveReceipt(receiptData);
  };

  return (
    <div className={styles.container}>
      
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div>
          <span className={styles.pageTag}>✦ EVERYDAY OPERATIONS</span>
          <h1>Daily POS & Billing Analytics</h1>
          <p>Real-time point of sale metrics, cash collections, shift totals, and customer receipts.</p>
        </div>

        <div className={styles.headerControls}>
          <div className={styles.datePickerWrap}>
            <Calendar size={18} className={styles.calendarIcon} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <button 
            className={styles.todayBtn}
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          >
            Today
          </button>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className={styles.metricsGrid}>
        
        {/* Gross Sales */}
        <div className={styles.metricCard}>
          <div className={styles.cardTop}>
            <span className={styles.metricLabel}>Total Day Sales</span>
            <div className={styles.iconCircleGold}><TrendingUp size={20} /></div>
          </div>
          <div className={styles.metricVal}>₹{metrics.grossSales.toLocaleString('en-IN')}</div>
          <span className={styles.metricSub}>{metrics.totalBills} Bills generated on {selectedDate}</span>
        </div>

        {/* Cash in Drawer */}
        <div className={styles.metricCard}>
          <div className={styles.cardTop}>
            <span className={styles.metricLabel}>Cash in Drawer</span>
            <div className={styles.iconCircleGreen}><Banknote size={20} /></div>
          </div>
          <div className={styles.metricVal}>₹{metrics.cashSales.toLocaleString('en-IN')}</div>
          <span className={styles.metricSub}>Physical cash received at counter</span>
        </div>

        {/* UPI / Digital */}
        <div className={styles.metricCard}>
          <div className={styles.cardTop}>
            <span className={styles.metricLabel}>UPI & QR Payments</span>
            <div className={styles.iconCircleBlue}><QrCode size={20} /></div>
          </div>
          <div className={styles.metricVal}>₹{metrics.upiSales.toLocaleString('en-IN')}</div>
          <span className={styles.metricSub}>Direct digital UPI settlements</span>
        </div>

        {/* Average Bill Size */}
        <div className={styles.metricCard}>
          <div className={styles.cardTop}>
            <span className={styles.metricLabel}>Avg Bill Size</span>
            <div className={styles.iconCirclePurple}><ShoppingCart size={20} /></div>
          </div>
          <div className={styles.metricVal}>₹{metrics.avgBill.toLocaleString('en-IN')}</div>
          <span className={styles.metricSub}>Average customer spend</span>
        </div>

      </div>

      {/* ── Middle: Top Selling Items Breakdown ── */}
      {metrics.topItems.length > 0 && (
        <div className={styles.topItemsCard}>
          <h3>🔥 Top Selling Bakery Items on {selectedDate}</h3>
          <div className={styles.topItemsList}>
            {metrics.topItems.map(([name, qty], idx) => (
              <div key={idx} className={styles.topItemChip}>
                <span className={styles.rankNum}>#{idx + 1}</span>
                <span className={styles.itemName}>{name}</span>
                <strong className={styles.itemSold}>{qty} sold</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Table: Filter & Invoices Log ── */}
      <div className={styles.tableCard}>
        
        {/* Table Filters Header */}
        <div className={styles.tableControls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Invoice #, Customer or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.paymentFilters}>
            {['All', 'Cash', 'UPI', 'Card'].map(mode => (
              <button 
                key={mode}
                className={`${styles.filterBtn} ${paymentFilter === mode ? styles.filterBtnActive : ''}`}
                onClick={() => setPaymentFilter(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loadingRow}>Loading POS Bills...</div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.emptyRow}>No POS bills recorded for {selectedDate}.</div>
          ) : (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date / Time</th>
                  <th>Customer</th>
                  <th>Order Type</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Cashier</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong className={styles.invNumber}>#{order.invoiceNumber}</strong>
                    </td>
                    <td>
                      <div className={styles.timeMeta}>
                        <span>{order.dateStr || 'Today'}</span>
                        <small>{order.timeStr || ''}</small>
                      </div>
                    </td>
                    <td>
                      <div className={styles.custMeta}>
                        <span>{order.customerName || 'Walk-in'}</span>
                        {order.customerPhone && <small>{order.customerPhone}</small>}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${styles['type_' + (order.orderType || 'Takeaway')]}`}>
                        {order.orderType || 'Takeaway'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.itemsSummary}>
                        {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') || '0 items'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.payBadge} ${styles['pay_' + (order.paymentMethod || 'Cash')]}`}>
                        {order.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td>
                      <strong className={styles.totalAmount}>₹{order.total?.toFixed(0)}</strong>
                    </td>
                    <td>
                      <span className={styles.cashierName}>{order.cashierName || 'Counter'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className={styles.reprintBtn}
                        onClick={() => handleReprintReceipt(order)}
                        title="Thermal Print / Re-issue Receipt"
                      >
                        <Printer size={16} /> Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* ── Thermal Receipt Modal ── */}
      {activeReceipt && (
        <ReceiptModal 
          data={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          onNewSale={() => setActiveReceipt(null)}
        />
      )}

    </div>
  );
}
