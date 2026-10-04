"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
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
  Eye,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  User,
  AlertTriangle,
  Printer,
  Calendar,
} from 'lucide-react';
import styles from './page.module.css';

interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price?: number;
  weight?: string;
  flavour?: string;
  flavor?: string;
  customization?: string;
  cakeMessage?: string;
  image?: string;
}

interface Order {
  id: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  customerName?: string;
  contactPhone?: string;
  contact?: string;
  phone?: string;
  deliveryAddress?: string;
  address?: string;
  deliveryCity?: string;
  items?: OrderItem[];
  subtotal?: number;
  discount?: number;
  couponCode?: string | null;
  deliveryFee?: number;
  totalPrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  specialInstructions?: string;
  status?: string;
  cancelReason?: string;
  cancelledAt?: any;
  paidAt?: any;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt?: any;
  updatedAt?: any;
}

const STATUS_OPTIONS = [
  'Preparing',
  'Cooking',
  'Out for delivery',
  'Completed',
  'Cancelled',
] as const;

type StatusType = (typeof STATUS_OPTIONS)[number] | 'Payment Pending';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Preparing: { color: '#5d4037', bg: 'rgba(93,64,55,0.1)', icon: Package },
  Cooking: { color: '#e65100', bg: 'rgba(230,81,0,0.1)', icon: ChefHat },
  'Out for delivery': { color: '#1565c0', bg: 'rgba(21,101,192,0.1)', icon: Truck },
  Completed: { color: '#2e7d32', bg: 'rgba(46,125,50,0.1)', icon: CircleCheckBig },
  Cancelled: { color: '#c62828', bg: 'rgba(198,40,40,0.1)', icon: XCircle },
  'Payment Pending': { color: '#c62828', bg: 'rgba(198,40,40,0.1)', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Real-time orders listener
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: Order[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      setOrders(data);
      // Keep selected order in sync if currently viewed
      setSelectedOrder((prev) => {
        if (!prev) return null;
        const updated = data.find((o) => o.id === prev.id);
        return updated || null;
      });
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
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled' || o.status === 'Payment Pending').length;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to permanently delete order #${orderId}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(orderId);
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete order. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusStyle = (status?: string): { color: string; bg: string } => {
    if (status && status in STATUS_CONFIG) {
      const cfg = STATUS_CONFIG[status];
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

  const formatCurrency = (amount: number | undefined): string => {
    const num = typeof amount === 'number' ? amount : 0;
    return `₹${num.toFixed(2)}`;
  };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>
            Manage, inspect full customer details, update status, and track orders in real-time
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
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    const customerName = order.userName || order.customerName || (order.userEmail ? order.userEmail.split('@')[0] : 'Customer');
                    const phone = order.contactPhone || order.contact || order.phone;

                    return (
                      <tr 
                        key={order.id} 
                        className={styles.tableRow}
                        onClick={() => setSelectedOrder(order)}
                        title="Click to view full order details"
                      >
                        <td>
                          <span className={styles.orderId}>
                            #{order.id.includes('-') ? order.id.toUpperCase() : order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={styles.orderDate}>
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div className={styles.customerCol}>
                            <span className={styles.customerName}>{customerName}</span>
                            <span className={styles.customerEmail}>{order.userEmail || '—'}</span>
                            {phone && <span className={styles.customerPhone}>📞 {phone}</span>}
                          </div>
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
                            {formatCurrency(order.totalPrice)}
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
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            className={styles.statusSelect}
                            value={order.status || 'Preparing'}
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
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className={styles.actionsCell}>
                            <button
                              type="button"
                              className={styles.viewBtn}
                              title="View full order details"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye size={16} />
                              <span>Details</span>
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              title="Delete this order"
                              disabled={deletingId === order.id}
                              onClick={(e) => handleDeleteOrder(order.id, e)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
                const customerName = order.userName || order.customerName || (order.userEmail ? order.userEmail.split('@')[0] : 'Customer');
                const phone = order.contactPhone || order.contact || order.phone;

                return (
                  <div 
                    key={order.id} 
                    className={styles.mobileCard}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className={styles.mobileCardHead}>
                      <div>
                        <span className={styles.orderId}>
                          #{order.id.includes('-') ? order.id.toUpperCase() : order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={styles.orderDate}>
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <span className={styles.totalPrice}>
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>

                    <div className={styles.mobileCardBody}>
                      <div className={styles.mobileRow}>
                        <span className={styles.mobileLabel}>Customer</span>
                        <div className={styles.customerColMobile}>
                          <span className={styles.customerName}>{customerName}</span>
                          <span className={styles.customerEmail}>{order.userEmail || '—'}</span>
                          {phone && <span className={styles.customerPhone}>📞 {phone}</span>}
                        </div>
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

                    <div className={styles.mobileCardFoot} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.mobileSelectRow}>
                        <label>Update Status:</label>
                        <select
                          className={styles.statusSelect}
                          value={order.status || 'Preparing'}
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
                      </div>

                      <div className={styles.mobileActionButtons}>
                        <button
                          type="button"
                          className={styles.viewBtnMobile}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={15} /> View Details
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtnMobile}
                          disabled={deletingId === order.id}
                          onClick={(e) => handleDeleteOrder(order.id, e)}
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── COMPLETE ORDER DETAILS MODAL ── */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitleRow}>
                  <h2 className={styles.modalTitle}>
                    Order #{selectedOrder.id.includes('-') ? selectedOrder.id.toUpperCase() : selectedOrder.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <span
                    className={styles.statusBadge}
                    style={{
                      color: getStatusStyle(selectedOrder.status).color,
                      background: getStatusStyle(selectedOrder.status).bg,
                    }}
                  >
                    {selectedOrder.status || 'Unknown'}
                  </span>
                </div>
                <p className={styles.modalDate}>
                  <Calendar size={14} /> Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button 
                type="button" 
                className={styles.closeBtn} 
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className={styles.modalStatusBar}>
              <span className={styles.modalStatusLabel}>Update Order Status:</span>
              <select
                className={styles.statusSelect}
                value={selectedOrder.status || 'Preparing'}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                style={{
                  borderColor: getStatusStyle(selectedOrder.status).color,
                  color: getStatusStyle(selectedOrder.status).color,
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {/* Customer & Delivery Grid */}
              <div className={styles.detailsGrid}>
                {/* Customer Details Box */}
                <div className={styles.detailBox}>
                  <h3 className={styles.detailBoxTitle}>
                    <User size={16} /> Customer Information
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Full Name:</span>
                    <span className={styles.detailValueBold}>
                      {selectedOrder.userName || selectedOrder.customerName || 'Valued Customer'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <a href={`mailto:${selectedOrder.userEmail}`} className={styles.detailLink}>
                      <Mail size={13} /> {selectedOrder.userEmail || '—'}
                    </a>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Contact Phone:</span>
                    {selectedOrder.contactPhone || selectedOrder.contact || selectedOrder.phone ? (
                      <div className={styles.phoneGroup}>
                        <a 
                          href={`tel:${selectedOrder.contactPhone || selectedOrder.contact || selectedOrder.phone}`} 
                          className={styles.detailLink}
                        >
                          <Phone size={13} /> {selectedOrder.contactPhone || selectedOrder.contact || selectedOrder.phone}
                        </a>
                        <a 
                          href={`https://wa.me/91${(selectedOrder.contactPhone || selectedOrder.contact || selectedOrder.phone || '').replace(/[^0-9]/g, '').slice(-10)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.whatsappChip}
                        >
                          WhatsApp
                        </a>
                      </div>
                    ) : (
                      <span className={styles.detailValue}>—</span>
                    )}
                  </div>
                </div>

                {/* Delivery Information Box */}
                <div className={styles.detailBox}>
                  <h3 className={styles.detailBoxTitle}>
                    <MapPin size={16} /> Delivery & Address
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>City / Area:</span>
                    <span className={styles.detailValueBold}>
                      {selectedOrder.deliveryCity || 'Tadepalle / Vijayawada'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Delivery Address:</span>
                    <span className={styles.detailValue}>
                      {selectedOrder.deliveryAddress || selectedOrder.address || 'Standard Delivery Address'}
                    </span>
                  </div>
                  {selectedOrder.specialInstructions && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Special Note:</span>
                      <span className={styles.instructionsValue}>
                        <FileText size={13} /> {selectedOrder.specialInstructions}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment & Transaction Box */}
                <div className={styles.detailBoxFull}>
                  <h3 className={styles.detailBoxTitle}>
                    <CreditCard size={16} /> Payment & Billing
                  </h3>
                  <div className={styles.paymentFlexRow}>
                    <div>
                      <span className={styles.detailLabel}>Payment Method</span>
                      <p className={styles.detailValueBold}>{selectedOrder.paymentMethod || 'Cash on Delivery (COD)'}</p>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>Payment Status</span>
                      <p className={styles.paymentStatusBadge}>{selectedOrder.paymentStatus || 'Pending'}</p>
                    </div>
                    {selectedOrder.razorpayPaymentId && (
                      <div>
                        <span className={styles.detailLabel}>Payment Reference</span>
                        <p className={styles.detailCode}>{selectedOrder.razorpayPaymentId}</p>
                      </div>
                    )}
                    {selectedOrder.cancelReason && (
                      <div className={styles.cancelReasonNotice}>
                        <AlertTriangle size={15} color="#c62828" />
                        <span><strong>Reason:</strong> {selectedOrder.cancelReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className={styles.itemsSection}>
                <h3 className={styles.itemsSectionTitle}>Ordered Items ({selectedOrder.items?.length || 0})</h3>
                <div className={styles.itemsTableWrap}>
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => {
                        const unitPrice = item.price ?? 0;
                        const itemTotal = unitPrice * item.quantity;
                        return (
                          <tr key={idx}>
                            <td>
                              <span className={styles.modalItemName}>{item.name}</span>
                              {(item.weight || item.flavour || item.flavor || item.customization || item.cakeMessage) && (
                                <div className={styles.itemMetaLine}>
                                  {item.weight && <span className={styles.metaBadge}>{item.weight}</span>}
                                  {(item.flavour || item.flavor) && <span className={styles.metaBadge}>{item.flavour || item.flavor}</span>}
                                  {item.customization && <span className={styles.metaBadge}>{item.customization}</span>}
                                  {item.cakeMessage && <span className={styles.cakeMessage}>“{item.cakeMessage}”</span>}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={styles.qtyBadge}>{item.quantity}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {unitPrice > 0 ? formatCurrency(unitPrice) : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                              {unitPrice > 0 ? formatCurrency(itemTotal) : formatCurrency(selectedOrder.totalPrice)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className={styles.financialSummary}>
                  <div className={styles.summaryRow}>
                    <span>Items Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.totalPrice)}</span>
                  </div>
                  {typeof selectedOrder.deliveryFee === 'number' && selectedOrder.deliveryFee > 0 && (
                    <div className={styles.summaryRow}>
                      <span>Delivery Fee:</span>
                      <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                    </div>
                  )}
                  {typeof selectedOrder.discount === 'number' && selectedOrder.discount > 0 && (
                    <div className={styles.summaryRowDiscount}>
                      <span>Discount ({selectedOrder.couponCode || 'Promo'}):</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className={styles.summaryRowGrandTotal}>
                    <span>Grand Total:</span>
                    <span className={styles.grandTotalValue}>{formatCurrency(selectedOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalDeleteBtn}
                disabled={deletingId === selectedOrder.id}
                onClick={() => handleDeleteOrder(selectedOrder.id)}
              >
                <Trash2 size={16} /> Delete Order
              </button>

              <div className={styles.modalRightActions}>
                <button
                  type="button"
                  className={styles.printBtn}
                  onClick={() => window.print()}
                >
                  <Printer size={16} /> Print Order
                </button>
                <button
                  type="button"
                  className={styles.closeModalBtn}
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
