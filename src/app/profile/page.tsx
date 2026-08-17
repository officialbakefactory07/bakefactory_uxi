"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  Package, Heart, MapPin, ChevronRight, Edit3, Check, X, Phone, Calendar, 
  Mail, User, HelpCircle, ChefHat, Truck, CircleCheckBig, Sparkles, CreditCard,
  Clock, AlertTriangle, XCircle
} from 'lucide-react';
import styles from './page.module.css';

const ORDER_STAGES = [
  { key: 'Preparing', label: 'Received', desc: 'Kitchen notified', icon: Package },
  { key: 'Cooking', label: 'Baking', desc: 'In Oven', icon: ChefHat },
  { key: 'Out for delivery', label: 'Dispatched', desc: 'Rider en route', icon: Truck },
  { key: 'Completed', label: 'Delivered', desc: 'Enjoy your dessert!', icon: CircleCheckBig },
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [dataError, setDataError] = useState(false);

  // Live ticking clock for 30-minute cancellation timer
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Live ticking timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time listener for user profile and orders
  useEffect(() => {
    if (!user) return;
    
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          if (!data.profileComplete) router.push('/profile/complete');
        } else {
          router.push('/profile/complete');
        }
      })
      .catch(() => {
        setDataError(true);
        setProfile({
          fullName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          phone: '',
          dob: '',
          gender: '',
          address: '',
        });
      });

    // Real-time Firestore snapshot listener for live status updates!
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const o: any[] = [];
      snap.forEach(d => o.push({ id: d.id, ...d.data() }));
      setOrders(o.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setOrdersCount(o.length);
    }, (error) => {
      console.error("Real-time orders listener error:", error);
      setOrders([]); 
      setOrdersCount(0);
    });

    return () => unsub();
  }, [user, router]);

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      await updateDoc(doc(db, 'orders', cancellingOrder.id), {
        status: 'Cancelled',
        cancelReason: cancelReason.trim() || 'Customer requested cancellation',
        cancelledAt: new Date()
      });
      setCancellingOrder(null);
      setCancelReason('');
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const startEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value || '');
  };

  const saveEdit = async () => {
    if (!user || !editField) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { [editField]: editValue });
      setProfile((prev: any) => ({ ...prev, [editField]: editValue }));
      setEditField(null);
    } catch {
      alert('Could not save. Please update Firestore rules.');
    } finally {
      setSaving(false);
    }
  };

  const getAvatarSrc = () => {
    const url = profile?.photoURL || user?.photoURL;
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      return url;
    }
    if (profile?.gender === 'male') {
      return '/avatar-male.svg';
    }
    if (profile?.gender === 'female') {
      return '/avatar-female.svg';
    }
    return null;
  };

  const getInitials = (name: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'Completed': '#2e7d32',
      'Out for delivery': '#1565c0',
      'Cooking': '#e65100',
      'Preparing': '#6d4c41',
      'Cancelled': '#c62828',
    };
    return map[status] || '#6d4c41';
  };

  const getStageIndex = (status?: string) => {
    switch (status) {
      case 'Preparing': return 0;
      case 'Cooking': return 1;
      case 'Out for delivery': return 2;
      case 'Completed': return 3;
      default: return 0;
    }
  };

  const getProgressPercentage = (status?: string) => {
    switch (status) {
      case 'Preparing': return 25;
      case 'Cooking': return 50;
      case 'Out for delivery': return 75;
      case 'Completed': return 100;
      case 'Cancelled': return 0;
      default: return 15;
    }
  };

  const getLiveMessage = (status?: string) => {
    switch (status) {
      case 'Preparing':
        return '👨‍🍳 Order received! Our bakers are preparing fresh ingredients.';
      case 'Cooking':
        return '🔥 Baking in the Oven! Our master pastry chef is preparing your treats with passion.';
      case 'Out for delivery':
        return '🛵 Out for Delivery! Rider is bringing your fresh order to your address.';
      case 'Completed':
        return '🎉 Order Delivered! Thank you for ordering with Bake Factory.';
      case 'Cancelled':
        return '🚫 Order Cancelled. Refund (if applicable) will be processed to your account.';
      default:
        return '✨ Order is being processed.';
    }
  };

  if (loading || !profile) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>

        {dataError && (
          <div className={styles.warningBanner}>
            ⚠️ Firestore rules not configured yet — some data may not load. Set rules in Firebase Console.
          </div>
        )}

        {/* ── Profile Header ── */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarBlock}>
            {getAvatarSrc() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getAvatarSrc()!} alt="avatar" className={styles.avatarPhoto} />
            ) : (
              <div className={styles.avatarInitials}>{getInitials(profile.fullName)}</div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1>{profile.fullName || user?.displayName || 'Your Name'}</h1>
            <p className={styles.phoneDisplay}>
              <Phone size={14} />
              {profile.phone || 'Add phone number'}
            </p>
          </div>
        </div>

        {/* ── Quick Action Cards ── */}
        <div className={styles.quickActions}>
          <button className={styles.actionCard} onClick={() => setActiveSection(activeSection === 'orders' ? null : 'orders')}>
            <Package size={28} />
            <span>Your Orders</span>
            {ordersCount > 0 && <span className={styles.count}>{ordersCount}</span>}
          </button>
          <button className={styles.actionCard} onClick={() => router.push('/contact')}>
            <HelpCircle size={28} />
            <span>Help & Support</span>
          </button>
          <button className={styles.actionCard} onClick={() => setActiveSection(activeSection === 'wishlist' ? null : 'wishlist')}>
            <Heart size={28} />
            <span>Your Wishlist</span>
          </button>
        </div>

        {/* ── Orders Panel with Real-time Bakery Tracker ── */}
        {activeSection === 'orders' && (
          <div className={styles.panel}>
            <div className={styles.panelHeaderRow}>
              <h2 className={styles.panelTitle}>Your Orders ({ordersCount})</h2>
              <span className={styles.liveSyncBadge}>
                <span className={styles.pulseDot} /> Real-Time Live Sync
              </span>
            </div>

            {orders.length === 0 ? (
              <div className={styles.emptyPanel}>
                <Package size={40} opacity={0.3} />
                <p>No orders placed yet.</p>
                <button className={styles.goBtn} onClick={() => router.push('/menu')}>Browse Menu</button>
              </div>
            ) : orders.map(order => {
              const stageIdx = getStageIndex(order.status);
              const progressPct = getProgressPercentage(order.status);
              const isCompleted = order.status === 'Completed';
              const isCancelled = order.status === 'Cancelled';

              // 30-Minute Cancellation Window Calculation
              const orderTimeMs = order.createdAt?.seconds ? order.createdAt.seconds * 1000 : currentTime;
              const elapsedMs = currentTime - orderTimeMs;
              const thirtyMinsMs = 30 * 60 * 1000;
              const remainingMs = Math.max(0, thirtyMinsMs - elapsedMs);
              const canCancel = remainingMs > 0 && !isCancelled && !isCompleted;

              const minutesLeft = Math.floor(remainingMs / 60000);
              const secondsLeft = Math.floor((remainingMs % 60000) / 1000);
              const countdownText = `${minutesLeft}m ${secondsLeft.toString().padStart(2, '0')}s`;

              return (
                <div key={order.id} className={styles.orderCard}>
                  
                  {/* Order Top Info */}
                  <div className={styles.orderCardHeader}>
                    <div>
                      <div className={styles.orderIdRow}>
                        <strong className={styles.orderIdText}>#{order.id.slice(0, 8).toUpperCase()}</strong>
                        {!isCompleted && !isCancelled && (
                          <span className={styles.liveBadge}>
                            <span className={styles.pulseDotRed} /> LIVE TRACKING
                          </span>
                        )}
                      </div>
                      <p className={styles.orderDate}>
                        {order.createdAt?.seconds
                          ? new Date(order.createdAt.seconds * 1000).toLocaleString('en-IN', { 
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })
                          : 'Recent Order'}
                      </p>
                    </div>

                    <div className={styles.headerRightCol}>
                      <span className={styles.statusBadge} style={{ background: getStatusColor(order.status) + '18', color: getStatusColor(order.status) }}>
                        {order.status || 'Preparing'}
                      </span>
                      <p className={styles.orderTotalText}>Total: <strong>₹{(order.totalPrice ?? 0).toFixed(0)}</strong></p>
                    </div>
                  </div>

                  {/* ── Interactive Live Bakery Tracker ── */}
                  {!isCancelled && (
                    <div className={styles.trackerContainer}>
                      <div className={styles.progressBarTrack}>
                        <div 
                          className={styles.progressBarFill} 
                          style={{ width: `${progressPct}%` }} 
                        />
                      </div>

                      <div className={styles.stepperNodesRow}>
                        {ORDER_STAGES.map((stg, i) => {
                          const IconComp = stg.icon;
                          const isDone = i < stageIdx || isCompleted;
                          const isActive = i === stageIdx && !isCompleted;

                          return (
                            <div 
                              key={stg.key} 
                              className={`${styles.stepNode} ${isDone ? styles.stepDone : ''} ${isActive ? styles.stepActive : ''}`}
                            >
                              <div className={styles.nodeCircle}>
                                {isDone ? (
                                  <Check size={14} strokeWidth={3} />
                                ) : (
                                  <IconComp size={15} />
                                )}
                              </div>
                              <span className={styles.stepTitle}>{stg.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live Status Callout Box */}
                  <div className={`${styles.statusAlertBox} ${isCompleted ? styles.completedBox : isCancelled ? styles.cancelledBox : ''}`}>
                    <Sparkles size={16} className={styles.sparkleIcon} />
                    <span>{getLiveMessage(order.status)}</span>
                  </div>

                  {/* Order Items & 30-Minute Cancel Button Footer */}
                  <div className={styles.orderFooterRow}>
                    <div className={styles.orderItems}>
                      {order.items?.map((item: any, i: number) => (
                        <span key={i} className={styles.chip}>{item.quantity}× {item.name}</span>
                      ))}
                    </div>

                    <div className={styles.footerActionGroup}>
                      {order.paymentMethod && (
                        <span className={styles.paymentMethodChip}>
                          <CreditCard size={12} /> {order.paymentMethod}
                        </span>
                      )}

                      {/* 30-Minute Cancellation Button & Live Ticking Countdown */}
                      {canCancel && (
                        <div className={styles.cancelWrapper}>
                          <span className={styles.timerBadge}>
                            <Clock size={12} className={styles.timerSpin} /> {countdownText} left
                          </span>
                          <button 
                            className={styles.cancelOrderBtn}
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelReason('');
                            }}
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}

                      {/* Info tag when 30-minute cancellation window closes */}
                      {!canCancel && !isCancelled && !isCompleted && (
                        <span className={styles.windowClosedTag} title="30-minute cancellation window has ended">
                          🔒 Cancellation closed (30m passed)
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ── Wishlist Panel ── */}
        {activeSection === 'wishlist' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Your Wishlist</h2>
            <div className={styles.emptyPanel}>
              <Heart size={40} opacity={0.3} />
              <p>Your wishlist is empty.</p>
              <button className={styles.goBtn} onClick={() => router.push('/menu')}>Explore Menu</button>
            </div>
          </div>
        )}

        {/* ── Your Information List ── */}
        <div className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Your Information</h2>

          <div className={styles.infoList}>
            {/* Full Name */}
            <div className={styles.infoRow}>
              <div className={styles.infoLeft}>
                <User size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Full Name</span>
                  <span className={styles.infoValue}>{profile.fullName || '—'}</span>
                </div>
              </div>
              <button className={styles.editRowBtn} onClick={() => startEdit('fullName', profile.fullName)}>
                <Edit3 size={16} />
              </button>
            </div>

            {/* Phone */}
            <div className={styles.infoRow}>
              <div className={styles.infoLeft}>
                <Phone size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Mobile Number</span>
                  <span className={styles.infoValue}>{profile.phone || '—'}</span>
                </div>
              </div>
              <button className={styles.editRowBtn} onClick={() => startEdit('phone', profile.phone)}>
                <Edit3 size={16} />
              </button>
            </div>

            {/* Email */}
            <div className={styles.infoRow}>
              <div className={styles.infoLeft}>
                <Mail size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Email Address</span>
                  <span className={styles.infoValue}>{profile.email}</span>
                </div>
              </div>
            </div>

            {/* DOB */}
            <div className={styles.infoRow}>
              <div className={styles.infoLeft}>
                <Calendar size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Date of Birth</span>
                  <span className={styles.infoValue}>{profile.dob || '—'}</span>
                </div>
              </div>
              <button className={styles.editRowBtn} onClick={() => startEdit('dob', profile.dob)}>
                <Edit3 size={16} />
              </button>
            </div>

            {/* Gender */}
            <div className={styles.infoRow}>
              <div className={styles.infoLeft}>
                <User size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Gender</span>
                  <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{profile.gender || '—'}</span>
                </div>
              </div>
              <button className={styles.editRowBtn} onClick={() => startEdit('gender', profile.gender)}>
                <Edit3 size={16} />
              </button>
            </div>

            {/* Saved Address */}
            <div className={styles.infoRow}>
              <div className={styles.infoLeft}>
                <MapPin size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Saved Address</span>
                  <span className={styles.infoValue}>{profile.address || '—'}</span>
                </div>
              </div>
              <button className={styles.editRowBtn} onClick={() => startEdit('address', profile.address)}>
                <Edit3 size={16} />
              </button>
            </div>

            {/* Wishlist link */}
            <button className={styles.infoRow} onClick={() => setActiveSection('wishlist')} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div className={styles.infoLeft}>
                <Heart size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Your Wishlist</span>
                  <span className={styles.infoValue}>View saved items</span>
                </div>
              </div>
              <ChevronRight size={18} className={styles.chevron} />
            </button>

            {/* Orders link */}
            <button className={styles.infoRow} onClick={() => setActiveSection('orders')} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div className={styles.infoLeft}>
                <Package size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Your Orders</span>
                  <span className={styles.infoValue}>{ordersCount} order{ordersCount !== 1 ? 's' : ''} placed</span>
                </div>
              </div>
              <ChevronRight size={18} className={styles.chevron} />
            </button>
          </div>
        </div>

      </div>

      {/* ── Inline Edit Modal ── */}
      {editField && (
        <div className={styles.modalOverlay} onClick={() => setEditField(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Edit {editField === 'fullName' ? 'Full Name' : editField === 'phone' ? 'Mobile Number' : editField === 'dob' ? 'Date of Birth' : editField === 'gender' ? 'Gender' : 'Address'}</h3>
            {editField === 'address' ? (
              <textarea rows={3} value={editValue} onChange={e => setEditValue(e.target.value)} className={styles.modalInput} autoFocus />
            ) : editField === 'gender' ? (
              <select value={editValue} onChange={e => setEditValue(e.target.value)} className={styles.modalInput} autoFocus>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            ) : (
              <input
                type={editField === 'dob' ? 'date' : editField === 'phone' ? 'tel' : 'text'}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className={styles.modalInput}
                autoFocus
              />
            )}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setEditField(null)}>
                <X size={16} /> Cancel
              </button>
              <button className={styles.saveBtn} onClick={saveEdit} disabled={saving}>
                <Check size={16} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Order Modal ── */}
      {cancellingOrder && (
        <div className={styles.modalOverlay} onClick={() => setCancellingOrder(null)}>
          <div className={styles.cancelModal} onClick={e => e.stopPropagation()}>
            <div className={styles.cancelModalHeader}>
              <AlertTriangle size={26} color="#c62828" />
              <h3>Cancel Order #{cancellingOrder.id.slice(0, 8).toUpperCase()}</h3>
            </div>

            <p className={styles.cancelNoticeText}>
              Are you sure you want to cancel this order? Fresh items are prepared upon order placement.
            </p>

            <div className={styles.reasonBlock}>
              <label>Reason for Cancellation (Optional)</label>
              <select 
                value={cancelReason} 
                onChange={e => setCancelReason(e.target.value)}
                className={styles.reasonSelect}
              >
                <option value="">Select a reason...</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Change of mind">Change of mind</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Want to add/change items">Want to add/change items</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.cancelModalActions}>
              <button className={styles.keepOrderBtn} onClick={() => setCancellingOrder(null)}>
                Keep Order
              </button>
              <button 
                className={styles.confirmCancelBtn} 
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
