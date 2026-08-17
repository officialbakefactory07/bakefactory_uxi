"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Plus, Tag, Calendar, Edit3, Trash2, X, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

interface Offer {
  id: string;
  code: string;
  description: string;
  type: 'Percentage' | 'Flat';
  value: number;
  minOrder: number;
  maxDiscount: number;
  validUntil: string;
  usageLimit: string;
  active: boolean;
}

const INITIAL_FORM = {
  code: '',
  description: '',
  type: 'Percentage' as 'Percentage' | 'Flat',
  value: '',
  minOrder: '0',
  maxDiscount: '100',
  validUntil: '',
  usageLimit: 'Unlimited',
  active: true,
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Fetch offers
  useEffect(() => {
    async function fetchOffers() {
      try {
        const snap = await getDocs(collection(db, 'offers'));
        const list: Offer[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            code: data.code || '',
            description: data.description || '',
            type: data.type || 'Percentage',
            value: data.value || 0,
            minOrder: data.minOrder || 0,
            maxDiscount: data.maxDiscount || 0,
            validUntil: data.validUntil || '',
            usageLimit: data.usageLimit || 'Unlimited',
            active: data.active !== false,
          });
        });
        setOffers(list);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setForm({
      code: offer.code,
      description: offer.description,
      type: offer.type,
      value: String(offer.value),
      minOrder: String(offer.minOrder),
      maxDiscount: String(offer.maxDiscount),
      validUntil: offer.validUntil,
      usageLimit: offer.usageLimit,
      active: offer.active,
    });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;
    setSubmitting(true);

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      type: form.type,
      value: parseFloat(form.value),
      minOrder: parseFloat(form.minOrder || '0'),
      maxDiscount: parseFloat(form.maxDiscount || '0'),
      validUntil: form.validUntil,
      usageLimit: form.usageLimit.trim(),
      active: form.active,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'offers', editingId), payload);
        setOffers((prev) =>
          prev.map((o) => (o.id === editingId ? { ...o, ...payload } : o))
        );
      } else {
        const docRef = await addDoc(collection(db, 'offers'), payload);
        setOffers((prev) => [...prev, { id: docRef.id, ...payload }]);
      }
      handleClose();
    } catch (err) {
      console.error('Error saving offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await deleteDoc(doc(db, 'offers', id));
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No expiry';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Offers</h1>
          <p className={styles.subtitle}>
            Offers &amp; Coupons &mdash; {offers.length} coupon{offers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={18} />
          Create Offer
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className={styles.emptyState}>
          <Tag size={40} className={styles.emptyIcon} />
          <p>No coupons or offers created yet. Click &quot;Create Offer&quot; to launch your first deal!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {offers.map((offer) => (
            <div key={offer.id} className={styles.card} data-active={offer.active}>
              {/* Card Header */}
              <div className={styles.cardTop}>
                <div className={styles.codeWrap}>
                  <Tag size={16} />
                  <span className={styles.code}>{offer.code}</span>
                </div>
                <span className={`${styles.badge} ${offer.active ? styles.badgeActive : styles.badgeInactive}`}>
                  {offer.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              {/* Description */}
              <p className={styles.desc}>{offer.description}</p>

              {/* Stats */}
              <div className={styles.statsGrid}>
                <div className={styles.statCol}>
                  <span className={styles.statLabel}>Discount</span>
                  <span className={styles.statVal}>
                    {offer.type === 'Percentage' ? `${offer.value}%` : `₹${offer.value}`}
                  </span>
                </div>
                <div className={styles.statCol}>
                  <span className={styles.statLabel}>Min Order</span>
                  <span className={styles.statVal}>₹{offer.minOrder}</span>
                </div>
                <div className={styles.statCol}>
                  <span className={styles.statLabel}>Max Disc</span>
                  <span className={styles.statVal}>
                    {offer.type === 'Percentage' ? `₹${offer.maxDiscount}` : 'N/A'}
                  </span>
                </div>
                <div className={styles.statCol}>
                  <span className={styles.statLabel}>Usage Limit</span>
                  <span className={styles.statVal}>{offer.usageLimit}</span>
                </div>
              </div>

              {/* Expiry */}
              <div className={styles.expiryRow}>
                <Calendar size={14} />
                <span>Valid until: <strong>{formatDate(offer.validUntil)}</strong></span>
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => handleOpenEdit(offer)}>
                  <Edit3 size={15} /> Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(offer.id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Offer' : 'Create Offer'}</h2>
              <button className={styles.modalClose} onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* Coupon Code */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  COUPON CODE <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., WELCOME10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  DESCRIPTION <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Get 10% OFF on your first order"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              {/* Type + Value */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>TYPE</label>
                  <select
                    className={styles.select}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Flat">Flat Amount</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    VALUE <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    placeholder={form.type === 'Percentage' ? '%' : '₹'}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Min Order + Max Discount */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>MIN ORDER VALUE (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>MAX DISCOUNT (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    disabled={form.type === 'Flat'}
                  />
                </div>
              </div>

              {/* Valid Until + Usage Limit */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    VALID UNTIL <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    className={styles.input}
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>USAGE LIMIT</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  />
                </div>
              </div>

              {/* Active */}
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  <span>Active &amp; Enable for Checkout</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Creating...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
