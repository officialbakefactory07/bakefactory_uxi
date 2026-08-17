"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Search, Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import styles from './page.module.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  bestSeller: boolean;
  special: boolean;
  image: string;
  subcategory?: string;
}

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  bestSeller: boolean;
  special: boolean;
  image: string;
  subcategory: string;
};

const CATEGORIES = ['All', 'Cakes', 'Desserts', 'Cookies', 'Combos'] as const;

const INITIAL_FORM: FormData = {
  name: '',
  description: '',
  price: '',
  category: 'Cakes',
  available: true,
  bestSeller: false,
  special: false,
  image: '',
  subcategory: '',
};

const CATEGORY_COLORS: Record<string, string> = {
  Cakes: '#d4a017',
  Desserts: '#e74c3c',
  Cookies: '#5c2f0e',
  Combos: '#2980b9',
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality JPEG
          setForm((prev) => ({ ...prev, image: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ── Fetch menu items ──
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const snap = await getDocs(collection(db, 'menu'));
        const data: MenuItem[] = [];
        snap.forEach((d) => {
          data.push({
            id: d.id,
            name: d.data().name || '',
            description: d.data().description || '',
            price: d.data().price || 0,
            category: d.data().category || 'Cakes',
            available: d.data().available !== false,
            bestSeller: d.data().bestSeller || false,
            special: d.data().special || false,
            image: d.data().image || '',
            subcategory: d.data().subcategory || '',
          });
        });
        setItems(data);
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // ── Filtered items ──
  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== 'All') {
      result = result.filter((i) => i.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeCategory, searchQuery]);

  // ── Open modal for adding ──
  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  // ── Open modal for editing ──
  const handleOpenEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      available: item.available,
      bestSeller: item.bestSeller,
      special: item.special,
      image: item.image || '',
      subcategory: item.subcategory || '',
    });
    setModalOpen(true);
  };

  // ── Close modal ──
  const handleClose = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  // ── Submit (create or update) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    setSubmitting(true);

    try {
      let finalImageUrl = form.image || '';

      // If image is a newly selected base64 string, upload to Cloudinary via server API
      if (form.image && form.image.startsWith('data:')) {
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: form.image }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Upload failed with status ${response.status}`);
          }

          const uploadData = await response.json();
          finalImageUrl = uploadData.url;
        } catch (uploadError: any) {
          console.error("Cloudinary upload error via API:", uploadError);
          alert(`Image upload to Cloudinary failed: ${uploadError.message || uploadError}.`);
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        ingredients: form.description.trim(), // Map description to ingredients for public menu
        price: parseFloat(form.price),
        category: form.category,
        available: form.available,
        bestSeller: form.bestSeller,
        special: form.special,
        image: finalImageUrl,
        subcategory: form.subcategory,
      };

      if (editingId) {
        // Update
        await updateDoc(doc(db, 'menu', editingId), payload);
        setItems((prev) =>
          prev.map((i) => (i.id === editingId ? { ...i, ...payload } : i))
        );
      } else {
        // Create
        const docRef = await addDoc(collection(db, 'menu'), payload);
        setItems((prev) => [...prev, { id: docRef.id, ...payload }]);
      }
      handleClose();
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      alert(`Error saving menu item: ${err.message || err}. Ensure you have updated the database rules in your Firebase Console!`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'menu', id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Error deleting menu item:', err);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Menu</h1>
          <p className={styles.subtitle}>
            Menu Management &mdash; {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* ── Category tabs + Search ── */}
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.emptyState}>Loading menu items…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery || activeCategory !== 'All'
            ? 'No items match your filters.'
            : 'No menu items yet. Click "+ Add Item" to get started!'}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((item) => {
            const catColor = CATEGORY_COLORS[item.category] || '#888';
            const initial = item.category.charAt(0).toUpperCase();
            return (
              <div key={item.id} className={styles.card}>
                {/* Image placeholder */}
                <div
                  className={styles.cardImage}
                  style={{ backgroundColor: item.image ? 'transparent' : catColor }}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className={styles.cardInitial}>{initial}</span>
                  )}
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardTopRow}>
                    <h3 className={styles.cardName}>{item.name}</h3>
                    <span className={styles.statusBadge}>Live</span>
                  </div>

                  <span
                    className={styles.categoryBadge}
                    style={{
                      backgroundColor: `${catColor}15`,
                      color: catColor,
                    }}
                  >
                    {item.category}
                  </span>

                  <p className={styles.cardPrice}>₹{item.price.toFixed(2)}</p>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleOpenEdit(item)}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
              <button className={styles.modalClose} onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  NAME <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter item name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>DESCRIPTION</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter item description"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Price + Category side by side */}
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    PRICE <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    placeholder="₹ 0.00"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    CATEGORY <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.select}
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value, subcategory: e.target.value === 'Cakes' ? 'Dry Cakes' : '' })
                    }
                  >
                    <option value="Cakes">Cakes</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>
              </div>

              {/* Sub-category dropdown if category is Cakes */}
              {form.category === 'Cakes' && (
                <div className={styles.fieldGroup} style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>SUB-CATEGORY</label>
                  <select
                    className={styles.select}
                    value={form.subcategory || 'Dry Cakes'}
                    onChange={(e) =>
                      setForm({ ...form, subcategory: e.target.value })
                    }
                  >
                    <option value="Dry Cakes">Dry Cakes</option>
                    <option value="Cool Cakes">Cool Cakes</option>
                    <option value="Designed Cakes">Designed Cakes</option>
                    <option value="Fancy Cakes">Fancy Cakes</option>
                    <option value="Semi Foundant Cakes">Semi Foundant Cakes</option>
                    <option value="Foundant Cakes">Foundant Cakes</option>
                  </select>
                </div>
              )}

              {/* Image upload */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>IMAGE</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                <div
                  className={styles.uploadArea}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundImage: form.image ? `url(${form.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: form.image ? '150px' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {!form.image && (
                    <>
                      <Upload size={28} className={styles.uploadIcon} />
                      <p className={styles.uploadText}>
                        Click or drag to upload an image
                      </p>
                      <span className={styles.uploadHint}>
                        PNG, JPG up to 5MB
                      </span>
                    </>
                  )}
                  {form.image && (
                    <div style={{
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      color: 'white',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      padding: '2rem 0',
                    }}>
                      Change Image
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm({ ...form, available: e.target.checked })
                    }
                  />
                  <span>Available</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.bestSeller}
                    onChange={(e) =>
                      setForm({ ...form, bestSeller: e.target.checked })
                    }
                  />
                  <span>Best Seller</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.special}
                    onChange={(e) =>
                      setForm({ ...form, special: e.target.checked })
                    }
                  />
                  <span>Special</span>
                </label>
              </div>

              {/* Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving…'
                    : editingId
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
