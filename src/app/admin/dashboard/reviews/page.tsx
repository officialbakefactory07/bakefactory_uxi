"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Search,
  MessageSquare,
} from 'lucide-react';
import styles from './page.module.css';

interface Review {
  id: string;
  name: string;
  location?: string;
  rating: number;
  comment: string;
  userEmail?: string;
  userId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Real-time listener for all reviews
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Review[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name || 'Anonymous Customer',
            location: data.location || 'Vijayawada',
            rating: Number(data.rating) || 5,
            comment: data.comment || '',
            userEmail: data.userEmail || '',
            userId: data.userId || '',
            status: data.status || 'pending',
            createdAt: data.createdAt,
          });
        });
        setReviews(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching reviews for admin:', err);
        // Fallback without orderBy if index is still indexing
        const fallbackUnsub = onSnapshot(collection(db, 'reviews'), (snap) => {
          const list: Review[] = [];
          snap.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || 'Anonymous Customer',
              location: data.location || 'Vijayawada',
              rating: Number(data.rating) || 5,
              comment: data.comment || '',
              userEmail: data.userEmail || '',
              userId: data.userId || '',
              status: data.status || 'pending',
              createdAt: data.createdAt,
            });
          });
          setReviews(list);
          setLoading(false);
        });
        return () => fallbackUnsub();
      }
    );

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'reviews', id), {
        status: newStatus,
        reviewedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating review status:', err);
      alert('Failed to update review status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  const filteredReviews = reviews.filter((r) => {
    const matchesTab = filterTab === 'all' || r.status === filterTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.userEmail && r.userEmail.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  const avgRating =
    approvedCount > 0
      ? (
          reviews
            .filter((r) => r.status === 'approved')
            .reduce((sum, r) => sum + r.rating, 0) / approvedCount
        ).toFixed(1)
      : '5.0';

  const formatReviewDate = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    try {
      const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.tagline}>
            <Star size={14} className={styles.goldSparkle} />
            <span>MODERATION &amp; TESTIMONIALS</span>
          </div>
          <h1 className={styles.title}>Customer Reviews</h1>
          <p className={styles.subtitle}>
            Manage and approve authentic customer reviews before they appear on the main website.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconPending}>
            <Clock size={22} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Pending Approval</span>
            <strong className={styles.statVal}>{pendingCount}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconApproved}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Approved Live</span>
            <strong className={styles.statVal}>{approvedCount}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconGold}>
            <Star size={22} fill="#D4A017" color="#D4A017" />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Average Live Rating</span>
            <strong className={styles.statVal}>{avgRating} ★</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconTotal}>
            <MessageSquare size={22} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Total Reviews</span>
            <strong className={styles.statVal}>{reviews.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className={styles.controlsRow}>
        <div className={styles.tabGroup}>
          <button
            className={`${styles.tabBtn} ${filterTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All ({reviews.length})
          </button>
          <button
            className={`${styles.tabBtn} ${filterTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('pending')}
          >
            Pending {pendingCount > 0 && <span className={styles.pendingBadge}>{pendingCount}</span>}
          </button>
          <button
            className={`${styles.tabBtn} ${filterTab === 'approved' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('approved')}
          >
            Approved ({approvedCount})
          </button>
          <button
            className={`${styles.tabBtn} ${filterTab === 'rejected' ? styles.activeTab : ''}`}
            onClick={() => setFilterTab('rejected')}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by customer, text, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Reviews List Grid */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading customer reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} className={styles.emptyIcon} />
          <h3>No Reviews Found</h3>
          <p>
            {filterTab === 'pending'
              ? 'There are no reviews waiting for approval right now.'
              : 'No reviews match your current filter or search criteria.'}
          </p>
        </div>
      ) : (
        <div className={styles.reviewsGrid}>
          {filteredReviews.map((rev) => {
            const isPending = rev.status === 'pending';
            const isApproved = rev.status === 'approved';
            const isRejected = rev.status === 'rejected';

            return (
              <div
                key={rev.id}
                className={`${styles.reviewCard} ${
                  isPending ? styles.cardPending : isApproved ? styles.cardApproved : styles.cardRejected
                }`}
              >
                {/* Top Row: Customer Info & Status Badge */}
                <div className={styles.cardTopRow}>
                  <div className={styles.customerInfo}>
                    <div className={styles.avatarCircle}>{rev.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 className={styles.customerName}>{rev.name}</h3>
                      <div className={styles.metaSub}>
                        {rev.location && (
                          <span className={styles.locationTag}>
                            <MapPin size={12} /> {rev.location}
                          </span>
                        )}
                        <span className={styles.dateTag}>{formatReviewDate(rev.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      isApproved
                        ? styles.badgeApproved
                        : isPending
                        ? styles.badgePending
                        : styles.badgeRejected
                    }`}
                  >
                    {isApproved ? 'LIVE ON SITE' : isPending ? 'PENDING APPROVAL' : 'REJECTED'}
                  </span>
                </div>

                {/* Star Rating Display */}
                <div className={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= rev.rating ? styles.starFilled : styles.starEmpty}
                      fill={star <= rev.rating ? '#D4A017' : 'none'}
                    />
                  ))}
                  <span className={styles.ratingNumber}>({rev.rating}/5)</span>
                </div>

                {/* Review Text */}
                <p className={styles.reviewComment}>&ldquo;{rev.comment}&rdquo;</p>

                {/* Email if available */}
                {rev.userEmail && (
                  <div className={styles.emailRow}>
                    <span>Customer Email: <strong>{rev.userEmail}</strong></span>
                  </div>
                )}

                {/* Admin Actions */}
                <div className={styles.actionsRow}>
                  {!isApproved && (
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleUpdateStatus(rev.id, 'approved')}
                      disabled={actionLoading === rev.id}
                      title="Approve to make visible on the main website"
                    >
                      <CheckCircle2 size={16} />
                      <span>{actionLoading === rev.id ? 'Updating...' : 'Approve & Publish'}</span>
                    </button>
                  )}

                  {!isRejected && (
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                      disabled={actionLoading === rev.id}
                      title="Reject this review"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(rev.id)}
                    disabled={actionLoading === rev.id}
                    title="Permanently delete review"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
